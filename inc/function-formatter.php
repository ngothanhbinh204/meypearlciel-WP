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
 * Normalize hotspot polygon data → array of {x, y} points.
 *
 * Supports two storage formats:
 *   New (JSON):   '{"points": [[12.5, 22.1], [42.8, 19.2], ...]}'
 *   Legacy (SVG): '10.5,20 30,20 30,50' (space-separated x,y pairs)
 *
 * Output: [{"x":10.5,"y":20}, {"x":30,"y":20}, ...]
 */
function re_format_polygon( $data ) {
    if ( empty( $data ) ) return array();

    if ( is_string( $data ) ) {
        $trimmed = trim( $data );

        // New format: JSON {"points": [[x,y], ...]}
        if ( $trimmed !== '' && $trimmed[0] === '{' ) {
            $decoded = json_decode( $trimmed, true );
            if ( ! empty( $decoded['points'] ) && is_array( $decoded['points'] ) ) {
                $points = array();
                foreach ( $decoded['points'] as $p ) {
                    if ( is_array( $p ) && count( $p ) >= 2 ) {
                        $points[] = array(
                            'x' => (float) $p[0],
                            'y' => (float) $p[1],
                        );
                    }
                }
                return $points;
            }
        }

        // Legacy format: "10,20 30,40 50,60"
        $points = array();
        $pairs  = preg_split( '/\s+/', $trimmed );
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

    return array();
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
    );

    if ( $include_floors ) {
        $building['floors'] = re_get_floors_by_building( $post_id );
    }

    return $building;
}


// ═══════════════════════════════════════════════════════════
// GLOBAL LEGEND HELPER
// ═══════════════════════════════════════════════════════════

/**
 * Đọc chú thích màu từ Theme Options (options page).
 * Kết quả được cache trong static variable — gọi nhiều lần không query lại.
 * Output: [{ color, status, label }, ...]
 */
function re_get_global_legend() {
    static $legend = null;

    if ( $legend !== null ) return $legend;

    $legend     = array();
    $legend_raw = get_field( 'global_legend', 'option' ) ?: array();

    foreach ( $legend_raw as $item ) {
        $legend[] = array(
            'color'  => $item['color']  ?? '',
            'status' => $item['status'] ?? '',
            'label'  => $item['label']  ?? '',
        );
    }

    return $legend;
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

    $floor = array(
        'id'          => (int) $post_id,
        'name'        => get_field( 'floor_name', $post_id ) ?: get_the_title( $post_id ),
        'number'      => (int) get_field( 'floor_number', $post_id ),
        'number_end'  => (int) get_field( 'floor_number_end', $post_id ) ?: null,
        'status'      => get_field( 'floor_status', $post_id ) ?: 'available',
        'description' => get_field( 'floor_description', $post_id ) ?: '',
        'image'       => re_format_image( get_field( 'floor_image', $post_id ) ),
        'thumbnail'   => re_format_image( get_field( 'floor_thumbnail', $post_id ) ),
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

    // Facilities — resolve từ re_utility catalog
    $facilities_raw = get_field( 'apartment_choose_facility', $post_id ) ?: array();
    $facilities     = array();

    foreach ( $facilities_raw as $f ) {
        $utility_id = (int) ( $f['facility_ref'] ?? 0 );

        if ( $utility_id && get_post_type( $utility_id ) === 're_utility' ) {
            // Lấy icon & label từ catalog, đảm bảo đồng nhất toàn site
            $icon  = get_field( 'utility_icon', $utility_id )  ?: '';
            $label = get_field( 'utility_label', $utility_id ) ?: get_the_title( $utility_id );
        } else {
            // Fallback nếu utility bị xóa
            $icon  = '';
            $label = '';
        }

        $facilities[] = array(
            'utility_id' => $utility_id,
            'icon'       => $icon,
            'label'      => $label,
            'value'      => $f['facility_value'] ?? '',
        );
    }

    // Sắp xếp theo utility_sort_order (nếu có)
    usort( $facilities, function ( $a, $b ) {
        $order_a = $a['utility_id'] ? (int) get_field( 'utility_sort_order', $a['utility_id'] ) : 99;
        $order_b = $b['utility_id'] ? (int) get_field( 'utility_sort_order', $b['utility_id'] ) : 99;
        return $order_a <=> $order_b;
    } );

    // Gallery
    $gallery = re_format_gallery( get_field( 'apartment_gallery', $post_id ) ?: array() );

    // Interaction: polygon drawn via Polygon Editor + display options
    $interaction = array(
        'polygon'        => re_format_polygon( get_field( 'apartment_polygon', $post_id ) ?: '' ),
        'hover_color'    => get_field( 'apartment_hover_color', $post_id ) ?: '#f97316',
        'popup_position' => get_field( 'apartment_popup_position', $post_id ) ?: 'top',
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
        'interaction' => $interaction,
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

    return array(
        'buildings' => $buildings,
        'legend'    => re_get_global_legend(),
    );
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

    // GET /wp-json/re/v1/page/{page_id}/utilities
    // Trả về floor_groups + amenities + polygons cho section home-5
    register_rest_route( 're/v1', '/page/(?P<page_id>\d+)/utilities', array(
        'methods'             => WP_REST_Server::READABLE,
        'callback'            => 're_rest_get_page_utilities',
        'permission_callback' => '__return_true',
        'args'                => array(
            'page_id' => array(
                'required'          => true,
                'validate_callback' => function ( $param ) {
                    return is_numeric( $param ) && intval( $param ) > 0;
                },
            ),
        ),
    ) );

    // GET /wp-json/re/v1/page/{page_id}/apartment-layout
    // Trả về buildings + polygons + floors + apartments cho section home-7
    register_rest_route( 're/v1', '/page/(?P<page_id>\d+)/apartment-layout', array(
        'methods'             => WP_REST_Server::READABLE,
        'callback'            => 're_rest_get_page_apartment_layout',
        'permission_callback' => '__return_true',
        'args'                => array(
            'page_id' => array(
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

/**
 * Callback: GET /re/v1/page/{page_id}/utilities
 * Trả về dữ liệu section utilities_all_in_one (home-5) theo page cụ thể.
 * Frontend dùng để render bản đồ tiện ích + toggle floor groups.
 */
function re_rest_get_page_utilities( WP_REST_Request $request ) {
    $page_id = (int) $request->get_param( 'page_id' );

    if ( ! get_post( $page_id ) ) {
        return new WP_Error( 'not_found', 'Không tìm thấy trang', array( 'status' => 404 ) );
    }

    $sections = get_field( 'page_sections', $page_id );
    if ( empty( $sections ) ) {
        return new WP_Error( 'no_sections', 'Trang không có sections', array( 'status' => 404 ) );
    }

    foreach ( $sections as $section ) {
        if ( ( $section['acf_fc_layout'] ?? '' ) === 'utilities_all_in_one' ) {
            return rest_ensure_response( re_format_utilities_section( $section ) );
        }
    }

    return new WP_Error( 'not_found', 'Không tìm thấy utilities section trong trang này', array( 'status' => 404 ) );
}

/**
 * Callback: GET /re/v1/page/{page_id}/apartment-layout
 * Trả về buildings + polygon từ ACF section + floors + apartments từ CPT (home-7).
 * Kết hợp polygon/color từ section với nested data từ CPT.
 */
function re_rest_get_page_apartment_layout( WP_REST_Request $request ) {
    $page_id = (int) $request->get_param( 'page_id' );

    if ( ! get_post( $page_id ) ) {
        return new WP_Error( 'not_found', 'Không tìm thấy trang', array( 'status' => 404 ) );
    }

    $sections = get_field( 'page_sections', $page_id );
    if ( empty( $sections ) ) {
        return new WP_Error( 'no_sections', 'Trang không có sections', array( 'status' => 404 ) );
    }

    foreach ( $sections as $section ) {
        if ( ( $section['acf_fc_layout'] ?? '' ) !== 'apartment_layout' ) continue;

        $buildings_data   = array();
        $masterplan_image = re_format_image( $section['masterplan_image'] ?? null );

        foreach ( $section['buildings'] ?? array() as $row ) {
            $building_id = (int) ( $row['building_ref'] ?? 0 );
            if ( ! $building_id ) continue;

            $building = format_building( $building_id, true );
            if ( ! $building ) continue;

            // Gắn thêm polygon + màu từ section ACF (không lưu trong CPT)
            $building['polygon'] = re_format_polygon( $row['building_polygon'] ?? '' );
            $building['color']   = sanitize_hex_color( $row['building_color'] ?? '' ) ?: '#f97316';
            $buildings_data[]    = $building;
        }

        return rest_ensure_response( array(
            'section_title'    => $section['section_title']    ?? '',
            'masterplan_image' => $masterplan_image,
            'buildings'        => $buildings_data,
            'legend'           => re_get_global_legend(),
        ) );
    }

    return new WP_Error( 'not_found', 'Không tìm thấy apartment layout section trong trang này', array( 'status' => 404 ) );
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

    $has_masterplan   = false;
    $buildings_rows   = array();
    $masterplan_image = null;

    foreach ( $sections as $section ) {
        if ( isset( $section['acf_fc_layout'] ) && $section['acf_fc_layout'] === 'apartment_layout' ) {
            $has_masterplan   = true;
            $buildings_rows   = $section['buildings'] ?? array();
            $masterplan_image = re_format_image( $section['masterplan_image'] ?? null );
            break;
        }
    }

    if ( ! $has_masterplan ) return;

    // Each buildings row: building_ref (post ID) + building_polygon + building_color
    $buildings_data = array();
    foreach ( $buildings_rows as $row ) {
        $building_id = (int) ( $row['building_ref'] ?? 0 );
        if ( ! $building_id ) continue;
        $building = format_building( $building_id, true );
        if ( ! $building ) continue;
        $building['polygon'] = re_format_polygon( $row['building_polygon'] ?? '' );
        $building['color']   = sanitize_hex_color( $row['building_color'] ?? '' ) ?: '#f97316';
        $buildings_data[] = $building;
    }

    $data = array(
        'buildings' => $buildings_data,
        'legend'    => re_get_global_legend(),
    );

    $data['meta'] = array(
        'masterplan_image' => $masterplan_image,
        'api_base'         => esc_url( rest_url( 're/v1' ) ),
        'nonce'            => wp_create_nonce( 'wp_rest' ),
    );

    wp_localize_script( 'front-end-main', 'RE_DATA', $data );

    // ─── Inject utilities section data (home-5) as RE_UTILITIES ────────────
    // Tránh frontend phải gọi thêm AJAX cho section tiện ích.
    foreach ( $sections as $section ) {
        if ( ( $section['acf_fc_layout'] ?? '' ) === 'utilities_all_in_one' ) {
            $utilities = re_format_utilities_section( $section );
            $utilities['meta'] = array(
                'api_base' => esc_url( rest_url( 're/v1' ) ),
                'page_id'  => get_queried_object_id(),
                'nonce'    => wp_create_nonce( 'wp_rest' ),
            );
            wp_localize_script( 'front-end-main', 'RE_UTILITIES', $utilities );
            break;
        }
    }
}


// ════════════════════════════════════════════════════════════════
// FORMAT UTILITIES SECTION
// ════════════════════════════════════════════════════════════════

/**
 * Parse camera_state JSON → sanitized array { scale, x, y }.
 * Used by re_format_utilities_section().
 *
 * @param  string $raw  Raw textarea value (JSON string).
 * @return array        { scale: float, x: float, y: float }
 */
function re_format_camera_state( $raw ) {
    if ( empty( $raw ) ) {
        return array( 'scale' => 1.0, 'x' => 50.0, 'y' => 50.0 );
    }
    $data = json_decode( trim( $raw ), true );
    if ( ! is_array( $data ) ) {
        return array( 'scale' => 1.0, 'x' => 50.0, 'y' => 50.0 );
    }
    return array(
        'scale' => (float) ( $data['scale'] ?? 1.0 ),
        'x'     => (float) ( $data['x']     ?? 50.0 ),
        'y'     => (float) ( $data['y']     ?? 50.0 ),
    );
}

/**
 * Format the utilities_all_in_one flexible content layout row
 * into a frontend-ready data structure.
 *
 * @param  array $layout  ACF flexible content row data.
 * @return array
 */
function re_format_utilities_section( $layout ) {
    $floor_groups = array();

    foreach ( $layout['floor_groups'] ?? array() as $floor ) {
        $amenities = array();

        foreach ( $floor['amenities'] ?? array() as $a ) {
            $amenities[] = array(
                'name'        => $a['amenity_name']        ?? '',
                'description' => $a['amenity_description'] ?? '',
                'polygon'     => re_format_polygon( $a['amenity_polygon'] ?? '' ),
            );
        }

        $floor_groups[] = array(
            'name'         => $floor['floor_name'] ?? '',
            'code'         => $floor['floor_code'] ?? '',
            'camera_state' => re_format_camera_state( $floor['camera_state'] ?? '' ),
            'amenities'    => $amenities,
        );
    }

    return array(
        'section_title'       => $layout['section_title']       ?? '',
        'section_description' => $layout['section_description'] ?? '',
        'section_image'       => re_format_image( $layout['section_image']    ?? null ),
        'masterplan_image'    => re_format_image( $layout['masterplan_image'] ?? null ),
        'floor_groups'        => $floor_groups,
    );
}