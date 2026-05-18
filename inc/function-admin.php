<?php

/**
 * RE Admin — Polygon Spatial Editor
 *
 * Enqueue admin assets và AJAX handlers cho polygon editor.
 * Assets chỉ load trên edit screen của re_building và page.
 */

if ( ! defined( 'ABSPATH' ) ) exit;


// ═══════════════════════════════════════════════════════════
// ENQUEUE ADMIN ASSETS
// ═══════════════════════════════════════════════════════════

add_action( 'admin_enqueue_scripts', 're_admin_enqueue_polygon_editor' );

function re_admin_enqueue_polygon_editor( $hook ) {
    // Only on post edit / new-post screens
    if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) return;

    // Determine current post type
    $post_id   = isset( $_GET['post'] ) ? (int) $_GET['post'] : 0;
    $post_type = $post_id
        ? get_post_type( $post_id )
        : ( isset( $_GET['post_type'] ) ? sanitize_key( $_GET['post_type'] ) : '' );

    if ( ! in_array( $post_type, array( 're_building', 'page', 're_apartment' ), true ) ) return;

    $theme_uri = get_template_directory_uri();
    $theme_dir = get_template_directory();

    // Version: filemtime cache buster
    $css_ver  = GENERATE_VERSION . '.' . @filemtime( $theme_dir . '/assets/admin/polygon-editor.css' );
    $svg_ver  = GENERATE_VERSION . '.' . @filemtime( $theme_dir . '/assets/admin/svg-overlay-engine.js' );
    $pe_ver   = GENERATE_VERSION . '.' . @filemtime( $theme_dir . '/assets/admin/polygon-editor.js' );
    $ve_ver   = GENERATE_VERSION . '.' . @filemtime( $theme_dir . '/assets/admin/viewport-editor.js' );

    // 1. CSS (no deps)
    wp_enqueue_style(
        're-polygon-editor-css',
        $theme_uri . '/assets/admin/polygon-editor.css',
        array(),
        $css_ver
    );

    // 2. SVG Overlay Engine — pure SVG, no deps, exports window.SvgOverlay
    wp_enqueue_script(
        're-svg-overlay-engine',
        $theme_uri . '/assets/admin/svg-overlay-engine.js',
        array(),
        $svg_ver,
        true
    );

    // 3. Polygon Editor — ACF-aware, depends on acf-input + SVG engine
    wp_enqueue_script(
        're-polygon-editor-js',
        $theme_uri . '/assets/admin/polygon-editor.js',
        array( 'acf-input', 're-svg-overlay-engine' ),
        $pe_ver,
        true
    );

    // 4. Viewport Editor — zoom/pan, depends on polygon-editor (mounts after it)
    wp_enqueue_script(
        're-viewport-editor-js',
        $theme_uri . '/assets/admin/viewport-editor.js',
        array( 're-polygon-editor-js' ),
        $ve_ver,
        true
    );

    // Localize config
    wp_localize_script( 're-polygon-editor-js', 'RE_ADMIN', array(
        'nonce'    => wp_create_nonce( 're_admin_nonce' ),
        'ajaxurl'  => admin_url( 'admin-ajax.php' ),
        'postType' => $post_type,
        'postId'   => $post_id,
    ) );
}



// ═══════════════════════════════════════════════════════════
// AJAX: GET FLOOR IMAGE
// Dùng cho apartment hotspot picker:
// khi editor chọn "Thuộc tầng", JS gọi AJAX này để lấy URL
// ảnh floor_image từ post re_floor tương ứng.
// ═══════════════════════════════════════════════════════════

add_action( 'wp_ajax_re_get_floor_image', 're_ajax_get_floor_image' );

function re_ajax_get_floor_image() {
    // Verify nonce
    if ( ! check_ajax_referer( 're_admin_nonce', 'nonce', false ) ) {
        wp_send_json_error( array( 'message' => 'Invalid nonce' ), 403 );
    }

    // Validate floor_id
    $floor_id = isset( $_POST['floor_id'] ) ? intval( $_POST['floor_id'] ) : 0;

    if ( ! $floor_id ) {
        wp_send_json_error( array( 'message' => 'Missing floor_id' ), 400 );
    }

    if ( get_post_type( $floor_id ) !== 're_floor' ) {
        wp_send_json_error( array( 'message' => 'Post is not re_floor' ), 400 );
    }

    if ( get_post_status( $floor_id ) !== 'publish' ) {
        wp_send_json_error( array( 'message' => 'Floor not published' ), 404 );
    }

    $image = get_field( 'floor_image', $floor_id );

    if ( empty( $image ) ) {
        wp_send_json_error( array( 'message' => 'No floor_image set for this floor' ), 404 );
    }

    wp_send_json_success( array(
        'url'    => esc_url( $image['url'] ),
        'width'  => (int) ( $image['width']  ?? 0 ),
        'height' => (int) ( $image['height'] ?? 0 ),
        'alt'    => esc_attr( $image['alt']   ?? '' ),
    ) );
}