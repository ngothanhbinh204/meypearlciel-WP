<?php

/**
 * Real Estate CPT Registration
 * Architecture: re_building → re_floor → re_apartment (child → parent relationship)
 */

add_action('init', 're_register_post_types');

function re_register_post_types()
{
    // ─────────────────────────────────────────────
    // CPT: re_building — Tòa nhà / Block
    // ─────────────────────────────────────────────
    create_post_type('re_building', array(
        'name'          => 'Tòa nhà',
        'singular_name' => 'Tòa nhà',
        'slug'          => 're-building',
        'icon'          => 'dashicons-building',
        'menu_position' => 25,
        'supports'      => array('title', 'thumbnail'),
        'has_archive'   => false,
        'show_in_rest'  => true,
        'exclude_from_search' => true,
    ));

    // ─────────────────────────────────────────────
    // CPT: re_floor — Tầng
    // ─────────────────────────────────────────────
    create_post_type('re_floor', array(
        'name'          => 'Tầng',
        'singular_name' => 'Tầng',
        'slug'          => 're-floor',
        'icon'          => 'dashicons-layout',
        'menu_position' => 26,
        'supports'      => array('title'),
        'has_archive'   => false,
        'show_in_rest'  => true,
        'exclude_from_search' => true,
    ));

    // ─────────────────────────────────────────────
    // CPT: re_apartment — Căn hộ
    // ─────────────────────────────────────────────
    create_post_type('re_apartment', array(
        'name'          => 'Căn hộ',
        'singular_name' => 'Căn hộ',
        'slug'          => 're-apartment',
        'icon'          => 'dashicons-admin-home',
        'menu_position' => 27,
        'supports'      => array('title'),
        'has_archive'   => false,
        'show_in_rest'  => true,
        'exclude_from_search' => true,
    ));

   