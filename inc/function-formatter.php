<?php

/**
 * Real Estate Formatter Layer
 *
 * Architecture: ACF raw data → Formatter → Frontend-ready JSON
 * Frontend KHÔNG đọc raw ACF. Chỉ consume output của các hàm formatter này.
 *
 * Public API:
 *   format_building( int $post_id ) : array
 *   format_floor( int $post_id )    : array
 *   format_apartment( int $post_id ): array
 *   format_masterplan_data()        : array  ← REST endpoint /re/v1/masterplan
 */

if ( ! defined( 'ABSPATH' ) ) exit;


// ═══════════════════════════════════════════════════════════
// HELPER FORMATTERS
// ═══════════════════════════════════════════════════════════

/**
 * Normalize ACF image field → { id, url, width, height, alt }
 * Trả về null nếu không có ảnh.
 */
function re_format_image( $acf_image ) {
    if ( empty( $acf_image ) ) return null;

    // ACF có thể trả về array hoặc string (url) tùy return_format
    if ( is_string( $acf_image ) ) {
        return array( 'url' => $acf_image );
    }

    return array(
        'id'     => (int) ( $acf_image['ID'] ?? 0 ),
        'url'    => $acf_image['url'] ?? '',
        'width'  => (int) ( $acf_image['width'] ?? 0 ),
        'height' => (int) ( $acf_image['height'] ?? 0 ),
        'alt'    => $acf_image['alt'] ?? '',
    );
}

/**
 * Normalize ACF gallery field → array of image objects
 */
function re_format_gallery( $acf_gallery ) {
    if ( empty( $acf_gallery ) || ! is_array( $acf_gallery ) ) return array();

    return array_map( 'wre_format_image_item', $acf_gallery );
}

function wre_format_image_item( $img ) {
    return re_format_image( $img );
}

/**
 * Normalize hotspot polygon string → array of {x, y} points
 * Input:  "10.5,20 30,20 30,50"
 * Output: [{"x":10.5,"y":20}, {"x":30,"y":20}, ...]
 */
function re_format_polygon( $polygon_string ) {
    if ( empty( $polygon_string ) ) return array();

    $points = array();
    $pairs  = preg_split( '/\s+/', trim( $polygon_string ) );

    foreach ( $pairs as $pair ) {
        $xy = explode( ',', $pair );
        if ( count( $xy ) === 2 ) {
            $points[] = array(
                'x' => (float) $xy[0],
                'y' => (float) $xy[1],
            );
        }
    }

    return $points;
}


// ═══════════════════════════════════════════════════════════
// FORMAT BUILDING
// ═══════════════════════════════════════════════════════════

/**
 * Format một building post thành frontend-ready array.
 * $include_floors = false để chỉ lấy thông tin tòa (dùng cho masterplan hover popup).
 * $include_floors = true để load full data kèm floors & apartments.
 */
function format_building( $post_id, $include_floors = false ) {
    if ( get_post_type( $post_id ) !== 're_building' ) return null;

    $hotspots_raw = get_field( 'building_hotspots', $post_id ) ?: array();
    $hotspots     = array();

    foreach ( $hotspots_raw as $hs ) {
        $hotspots[] = array(
            'x'             => (float) ( $hs['x'] ?? 0 ),
            'y'             => (float) ( $hs['y'] ?? 0 ),
            'width'         => (float) ( $hs['width'] ?? 0 ),
            'height'        => (float) ( $hs['height'] ?? 0 ),
            'polygon'       => re_format_polygon( $hs['polygon_points'] ?? '' ),
            'overlay_image' => $hs['overlay_image'] ?? null,
            'popup_position'=> $hs['popup_position'] ?? 'bottom',
        );
    }

    $building = array(
        'id'            => (int) $post_id,
        'name'          => get_field( 'building_name', $post_id ) ?: get_the_title( $post_id ),
        'code'          => get_field( 'building_code', $post_id ) ?: '',
        'status'        => get_field( 'building_status', $post_id ) ?: 'available',
        'total_floor'   => (int) get_field( 'building_total_floor', $post_id ),
        'total_apartment' => (int) get_field( 'building_total_apartment', $post_id ),
        'area'          => get_field( 'building_area', $post_id ) ?: '',
        'description'   => get_field( 'building_description', $post_id ) ?: '',
        'popup_summary' => get_field( 'building_popup_summary', $post_id ) ?: '',
        'thumbnail'     => re_format_image( get_field( 'building_thumbnail', $post_id ) ),
        'overlay_image' => re_format_image( get_field( 'building_overlay_image', $post_id ) ),
        'master_plan'   => re_format_image( get_field( 'building_master_plan', $post_id ) ),
        'hotspots'      => $hotspots,
    );

    if ( $include_floors ) {
        $building['floors'] = re_get_floors_by_building( $post_id );
    }

    return $building;
}


// ═══════════════════════════════════════════════════════════
// FORMAT FLOOR
// ═══════════════════════════════════════════════════════════

/**
 * Format một floor post thành frontend-ready array.
 * $include_apartments = true để load kèm danh sách căn hộ.
 */
function format_floor( $post_id, $include_apartments = true ) {
    if ( get_post_type( $post_id ) !== 're_floor' ) return null;

    $legend_raw = get_field( 'floor_legend_items', $post_id ) ?: array();
    $legend     = array();

    foreach ( $legend_raw as $item ) {
        $legend[] = array(
            'color' => $item['color'] ?? '',
            'label' => $item['label'] ?? '',
        );
    }

    $floor = array(
        'id'          => (int) $post_id,
        'name'        => get_field( 'floor_name', $post_id ) ?: get_the_title( $post_id ),
        'number'      => (int) get_field( 'floor_number', $post_id ),
        'number_end'  => (int) get_field( 'floor_number_end', $post_id ) ?: null,
        'status'      => get_field( 'floor_status', $post_id ) ?: 'available',
        'description' => get_field( 'floor_description', $post_id ) ?: '',
        'image'       => re_format_image( get_field( 'floor_image', $post_id ) ),
        'thumbnail'   => re_format_image( get_field( 'floor_thumbnail', $post_id ) ),
        'legend'      => $legend,
        'building_id' => (int) get_field( 'parent_building', $post_id ),
    );

    if ( $include_apartments ) {
        $floor['apartments'] = re_get_apartments_by_floor( $post_id );
    }

    return $floor;
}


// ═══════════════════════════════════════════════════════════
// FORMAT APARTMENT
// ═══════════════════════════════════════════════════════════

/**
 * Format một apartment post thành frontend-ready array.
 */
function format_apartment( $post_id ) {
    if ( get_post_type( $post_id ) !== 're_apartment' ) return null;

    // Facilities
    $facilities_raw = get_field( 'apartment_choose_facility', $post_id ) ?: array();
    $facilities     = array();

    foreach ( $facilities_raw as $f ) {
        $facilities[] = array(
            'icon'  => $f['icon']  ?? '',
            'label' => $f['label'] ?? '',
            'value' => $f['value'] ?? '',
        );
    }

    // Gallery
    $gallery = re_format_gallery( get_field( 'apartment_gallery', $post_id ) ?: array() );

    // Hotspot (group field)
    $hs_raw  = get_field( 'apartment_hotspot', $post_id ) ?: array();
    $hotspot = array(
        'x'             => (float) ( $hs_raw['x']             ?? 0 ),
        'y'             => (float) ( $hs_raw['y']             ?? 0 ),
        'width'         => (float) ( $hs_raw['width']         ?? 0 ),
        'height'        => (float) ( $hs_raw['height']        ?? 0 ),
        'polygon'       => re_format_polygon( $hs_raw['polygon_points'] ?? '' ),
        'popup_position'=> $hs_raw['popup_position'] ?? 'top',
        'hover_color'   => $hs_raw['hover_color'] ?? '#F97316',
    );

    return array(
        'id'          => (int) $post_id,
        'name'        => get_field( 'apartment_name', $post_id ) ?: get_the_title( $post_id ),
        'code'        => get_field( 'apartment_code', $post_id )        ?: '',
        'type'        => get_field( 'apartment_type', $post_id )        ?: '',
        'status'      => get_field( 'apartment_status', $post_id )      ?: 'available',
        'area_net'    => (float) get_field( 'apartment_area_net', $post_id ),
        'area_gross'  => (float) get_field( 'apartment_area_gross', $post_id ),
        'direction'   => get_field( 'apartment_direction', $post_id )   ?: '',
        'description' => get_field( 'apartment_description', $post_id ) ?: '',
        'layout'      => re_format_image( get_field( 'apartment_layout', $post_id ) ),
        'gallery'     => $gallery,
        'facilities'  => $facilities,
        'hotspot'     => $hotspot,
        'floor_id'    => (int) get_field( 'parent_floor', $post_id ),
    );
}


// ═══════════════════════════════════════════════════════════
// QUERY HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Lấy tất cả floors thuộc một building, sắp xếp theo floor_number ASC.
 * Trả về mảng các formatted floor (kèm apartments).
 */
function re_get_floors_by_building( $building_id ) {
    $query = new WP_Query( array(
        'post_type'      => 're_floor',
        'posts_per_page' => -1,
        'post_status'    => 'publish',
        'meta_query'     => array(
            array(
                'key'     => 'parent_building',
                'value'   => $building_id,
                'compare' => '=',
            ),
        ),
        'meta_key'       => 'floor_number',
        'orderby'        => 'meta_value_num',
        'order'          => 'ASC',
        'no_found_rows'  => true,
    ) );

    $floors = array();
    if ( $query->have_posts() ) {
        while ( $query->have_posts() ) {
            $query->the_post();
            $floors[] = format_floor( get_the_ID(), true );
        }
        wp_reset_postdata();
    }

    return $floors;
}

/**
 * Lấy tất cả apartments thuộc một floor.
 */
function re_get_apartments_by_floor( $floor_id ) {
    $query = new WP_Query( array(
        'post_type'      => 're_apartment',
        'posts_per_page' => -1,
        'post_status'    => 'publish',
        'meta_query'     => array(
            array(
                'key'     => 'parent_floor',
                'value'   => $floor_id,
                'compare' => '=',
            ),
        ),
        'orderby'        => 'title',
        'order'          => 'ASC',
        'no_found_rows'  => true,
    ) );

    $apartments = array();
    if ( $query->have_posts() ) {
        while ( $query->have_posts() ) {
            $query->the_post();
            $apartments[] = format_apartment( get_the_ID() );
        }
        wp_reset_postdata();
    }

    return $apartments;
}

/**
 * Lấy toàn bộ buildings với floors + apartments nested.
 * Đây là data chính cho masterplan viewer.
 */
function format_masterplan_data( $building_ids = array() ) {
    $args = array(
        'post_type'      => 're_building',
        'posts_per_page' => -1,
        'post_status'    => 'publish',
        'orderby'        => 'menu_order',
        'order'          => 'ASC',
        'no_found_rows'  => true,
    );

    if ( ! empty( $building_ids ) ) {
        $args['post__in'] = array_map( 'intval', $building_ids );
        $args['orderby']  = 'post__in';
    }

    $query     = new WP_Query( $args );
    $buildings = array();

    if ( $query->have_posts() ) {
        while ( $query->have_posts() ) {
            $query->the_post();
            $buildings[] = format_building( get_the_ID(), true );
        }
        wp_reset_postdata();
    }

    return array( 'buildings' => $buildings );
}


// ═══════════════════════════════════════════════════════════
// REST API ENDPOINT
// ═══════════════════════════════════════════════════════════

add_action( 'rest_api_init', 're_register_rest_routes' );

function re_register_rest_routes() {

    // GET /wp-json/re/v1/masterplan
    // Trả về toàn bộ buildings + floors + apartments (full nested JSON)
    register_rest_route( 're/v1', '/masterplan', array(
        'methods'             => WP_REST_Server::READABLE,
        'callback'            => 're_rest_get_masterplan',
        'permission_callback' => '__return_true',
    ) );

    // GET /wp-json/re/v1/buildings
    // Trả về danh sách buildings (không kèm floors — dùng cho masterplan level 1)
    register_rest_route( 're/v1', '/buildings', array(
        'methods'             => WP_REST_Server::READABLE,
        'callback'            => 're_rest_get_buildings',
        'permission_callback' => '__return_true',
    ) );

    // GET /wp-json/re/v1/building/{id}/floors
    // Trả về floors của một building (kèm apartments — dùng cho level 2 → 3)
    register_rest_route( 're/v1', '/building/(?P<id>\d+)/floors', array(
        'methods'             => WP_REST_Server::READABLE,
        'callback'            => 're_rest_get_building_floors',
        'permission_callback' => '__return_true',
        'args'                => array(
            'id' => array(
                'required'          => true,
                'validate_callback' => function ( $param ) {
                    return is_numeric( $param ) && intval( $param ) > 0;
                },
            ),
        ),
    ) );

    // GET /wp-json/re/v1/apartment/{id}
    // Trả về chi tiết một căn hộ (dùng cho level 4 popup)
    register_rest_route( 're/v1', '/apartment/(?P<id>\d+)', array(
        'methods'             => WP_REST_Server::READABLE,
        'callback'            => 're_rest_get_apartment',
        'permission_callback' => '__return_true',
        'args'                => array(
            'id' => array(
                'required'          => true,
                'validate_callback' => function ( $param ) {
                    return is_numeric( $param ) && intval( $param ) > 0;
                },
            ),
        ),
    ) );
}

/**
 * Callback: GET /re/v1/masterplan
 */
function re_rest_get_masterplan( WP_REST_Request $request ) {
    $building_ids = $request->get_param( 'buildings' );

    if ( ! empty( $building_ids ) ) {
        $building_ids = array_filter( array_map( 'intval', explode( ',', $building_ids ) ) );
    }

    $data = format_masterplan_data( $building_ids ?: array() );

    return rest_ensure_response( $data );
}

/**
 * Callback: GET /re/v1/buildings
 */
function re_rest_get_buildings( WP_REST_Request $request ) {
    $query = new WP_Query( array(
        'post_type'      => 're_building',
        'posts_per_page' => -1,
        'post_status'    => 'publish',
        'orderby'        => 'menu_order',
        'order'          => 'ASC',
        'no_found_rows'  => true,
    ) );

    $buildings = array();
    if ( $query->have_posts() ) {
        while ( $query->have_posts() ) {
            $query->the_post();
            // include_floors = false: chỉ lấy thông tin tòa + hotspot
            $buildings[] = format_building( get_the_ID(), false );
        }
        wp_reset_postdata();
    }

    return rest_ensure_response( array( 'buildings' => $buildings ) );
}

/**
 * Callback: GET /re/v1/building/{id}/floors
 */
function re_rest_get_building_floors( WP_REST_Request $request ) {
    $building_id = (int) $request->get_param( 'id' );

    if ( get_post_type( $building_id ) !== 're_building' ) {
        return new WP_Error( 'not_found', 'Không tìm thấy tòa nhà', array( 'status' => 404 ) );
    }

    $floors = re_get_floors_by_building( $building_id );

    return rest_ensure_response( array(
        'building_id' => $building_id,
        'floors'      => $floors,
    ) );
}

/**
 * Callback: GET /re/v1/apartment/{id}
 */
function re_rest_get_apartment( WP_REST_Request $request ) {
    $apartment_id = (int) $request->get_param( 'id' );

    if ( get_post_type( $apartment_id ) !== 're_apartment' ) {
        return new WP_Error( 'not_found', 'Không tìm thấy căn hộ', array( 'status' => 404 ) );
    }

    $apartment = format_apartment( $apartment_id );

    return rest_ensure_response( $apartment );
}


// ═══════════════════════════════════════════════════════════
// WP LOCALIZE — Inline JSON cho trang có apartment_layout
// ═══════════════════════════════════════════════════════════

/**
 * Nếu trang có section apartment_layout trong page_sections,
 * tự động inject masterplan JSON vào JS global window.RE_DATA
 * Tránh frontend phải gọi AJAX khi load lần đầu.
 */
add_action( 'wp_enqueue_scripts', 're_localize_masterplan_data', 20 );

function re_localize_masterplan_data() {
    if ( ! is_page() ) return;

    $sections = get_field( 'page_sections' );
    if ( empty( $sections ) ) return;

    $has_masterplan = false;
    $building_ids   = array();
    $default_building = 0;
    $masterplan_image = null;
    $display_style  = 'popup';

    foreach ( $sections as $section ) {
        if ( isset( $section['acf_fc_layout'] ) && $section['acf_fc_layout'] === 'apartment_layout' ) {
            $has_masterplan   = true;
            $building_ids     = $section['relationship_buildings'] ?? array();
            $default_building = (int) ( $section['default_building'] ?? 0 );
            $masterplan_image = re_format_image( $section['masterplan_image'] ?? null );
            $display_style    = $section['display_style'] ?? 'popup';
            break;
        }
    }

    if ( ! $has_masterplan ) return;

    $data = format_masterplan_data( $building_ids );

    $data['meta'] = array(
        'default_building' => $default_building,
        'masterplan_image' => $masterplan_image,
        'display_style'    => $display_style,
        'api_base'         => esc_url( rest_url( 're/v1' ) ),
        'nonce'            => wp_create_nonce( 'wp_rest' ),
    );

    wp_localize_script( 'front-end-main', 'RE_DATA', $data );
}