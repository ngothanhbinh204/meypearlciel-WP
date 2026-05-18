<?php

/**
 * Real Estate Admin Columns
 * Architecture:
 * Building → Floor → Apartment
 */

/**
 * =========================================================
 * APARTMENT COLUMNS
 * =========================================================
 */

/**
 * Add custom columns
 */
add_filter('manage_re_apartment_posts_columns', 're_apartment_admin_columns');

function re_apartment_admin_columns($columns)
{
    $new_columns = [];

    foreach ($columns as $key => $label) {

        $new_columns[$key] = $label;

        if ($key === 'title') {

            $new_columns['apartment_code']      = 'Mã căn';
            $new_columns['apartment_floor']     = 'Tầng';
            $new_columns['apartment_building']  = 'Tòa nhà';
            $new_columns['apartment_area']      = 'Diện tích';
            $new_columns['apartment_price']     = 'Giá';
            $new_columns['apartment_status']    = 'Trạng thái';
        }
    }

    return $new_columns;
}

/**
 * Render custom columns
 */
add_action(
    'manage_re_apartment_posts_custom_column',
    're_apartment_admin_columns_content',
    10,
    2
);

function re_apartment_admin_columns_content($column, $post_id)
{
    switch ($column) {

        /**
         * Apartment Code
         */
        case 'apartment_code':

            echo esc_html(
                get_field('code', $post_id)
            );

            break;

        /**
         * Floor
         */
        case 'apartment_floor':

            $floor = get_field('floor', $post_id);

            if ($floor) {
                echo esc_html($floor->post_title);
            } else {
                echo '—';
            }

            break;

        /**
         * Building
         */
        case 'apartment_building':

            $floor = get_field('floor', $post_id);

            if ($floor) {

                $building = get_field('building', $floor->ID);

                if ($building) {
                    echo esc_html($building->post_title);
                } else {
                    echo '—';
                }
            } else {
                echo '—';
            }

            break;

        /**
         * Area
         */
        case 'apartment_area':

            $area = get_field('area', $post_id);

            if ($area) {
                echo esc_html($area) . ' m²';
            } else {
                echo '—';
            }

            break;

        /**
         * Price
         */
        case 'apartment_price':

            $price = get_field('price', $post_id);

            if ($price) {
                echo number_format($price) . ' VNĐ';
            } else {
                echo '—';
            }

            break;

        /**
         * Status
         */
        case 'apartment_status':

            $status = get_field('status', $post_id);

            if ($status) {
                echo esc_html($status);
            } else {
                echo '—';
            }

            break;
    }
}

/**
 * =========================================================
 * SORTABLE COLUMNS
 * =========================================================
 */

add_filter(
    'manage_edit-re_apartment_sortable_columns',
    're_apartment_sortable_columns'
);

function re_apartment_sortable_columns($columns)
{
    $columns['apartment_code']   = 'apartment_code';
    $columns['apartment_area']   = 'apartment_area';
    $columns['apartment_price']  = 'apartment_price';

    return $columns;
}

/**
 * =========================================================
 * SORT QUERY
 * =========================================================
 */

add_action('pre_get_posts', 're_apartment_admin_orderby');

function re_apartment_admin_orderby($query)
{
    if (
        !is_admin()
        || !$query->is_main_query()
    ) {
        return;
    }

    $orderby = $query->get('orderby');

    switch ($orderby) {

        case 'apartment_code':

            $query->set('meta_key', 'code');
            $query->set('orderby', 'meta_value');

            break;

        case 'apartment_area':

            $query->set('meta_key', 'area');
            $query->set('orderby', 'meta_value_num');

            break;

        case 'apartment_price':

            $query->set('meta_key', 'price');
            $query->set('orderby', 'meta_value_num');

            break;
    }
}

/**
 * =========================================================
 * BUILDING FILTER DROPDOWN
 * =========================================================
 */

add_action('restrict_manage_posts', 're_apartment_building_filter');

function re_apartment_building_filter()
{
    global $typenow;

    if ($typenow !== 're_apartment') {
        return;
    }

    $buildings = get_posts([
        'post_type'      => 're_building',
        'posts_per_page' => -1,
        'orderby'        => 'title',
        'order'          => 'ASC',
    ]);

    $selected = $_GET['building_filter'] ?? '';

?>

<select name="building_filter">

	<option value="">
		Tất cả tòa nhà
	</option>

	<?php foreach ($buildings as $building): ?>

	<option value="<?php echo esc_attr($building->ID); ?>" <?php selected($selected, $building->ID); ?>>
		<?php echo esc_html($building->post_title); ?>
	</option>

	<?php endforeach; ?>

</select>

<?php
}

/**
 * =========================================================
 * FILTER QUERY BY BUILDING
 * =========================================================
 */

add_action('pre_get_posts', 're_apartment_filter_query');

function re_apartment_filter_query($query)
{
    global $pagenow;

    if (
        !is_admin()
        || !$query->is_main_query()
        || $pagenow !== 'edit.php'
    ) {
        return;
    }

    if (
        ($_GET['post_type'] ?? '') !== 're_apartment'
    ) {
        return;
    }

    if (empty($_GET['building_filter'])) {
        return;
    }

    $building_id = intval($_GET['building_filter']);

    /**
     * Get floors by building
     */
    $floors = get_posts([
        'post_type'      => 're_floor',
        'posts_per_page' => -1,
        'fields'         => 'ids',

        'meta_query' => [
            [
                'key'     => 'building',
                'value'   => $building_id,
                'compare' => '=',
            ]
        ]
    ]);

    if (empty($floors)) {
        $floors = [0];
    }

    /**
     * Filter apartments by floors
     */
    $meta_query = [
        [
            'key'     => 'floor',
            'value'   => $floors,
            'compare' => 'IN',
        ]
    ];

    $query->set('meta_query', $meta_query);
}

/**
 * =========================================================
 * ADMIN CSS
 * =========================================================
 */

add_action('admin_head', 're_admin_columns_style');

function re_admin_columns_style()
{
?>
<style>
.column-apartment_code {
	width: 120px;
}

.column-apartment_floor {
	width: 120px;
}

.column-apartment_building {
	width: 160px;
}

.column-apartment_area {
	width: 120px;
}

.column-apartment_price {
	width: 160px;
}

.column-apartment_status {
	width: 140px;
}
</style>
<?php
}