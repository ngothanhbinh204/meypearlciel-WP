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

            $new_columns['apartment_floor']     = 'Tầng';
            $new_columns['apartment_building']  = 'Tòa nhà';
            $new_columns['apartment_area']      = 'Diện tích';
            // $new_columns['apartment_status']    = 'Trạng thái';
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
         * Floor
         */
        case 'apartment_floor':

            $floor_id = get_field('parent_floor', $post_id);
            echo $floor_id ? esc_html(get_the_title($floor_id)) : '—';

            break;

        /**
         * Building
         */
        case 'apartment_building':

            $building_id = get_field('parent_building', $post_id);
            echo $building_id ? esc_html(get_the_title($building_id)) : '—';

            break;

        /**
         * Area
         */
        case 'apartment_area':

            $area = get_field('apartment_area_net', $post_id);
            echo $area ? esc_html($area) . ' m²' : '—';

            break;

        /**
         * Price
         */
        case 'apartment_price':

            $price = get_field('apartment_price', $post_id);
            echo $price ? number_format($price) . ' VNĐ' : '—';

            break;

        /**
         * Status
         */
        case 'apartment_status':

            $status = get_field('apartment_status', $post_id);
            $status_labels = [
                'available' => '<span class="re-status re-status--available">Còn hàng</span>',
                'reserved'  => '<span class="re-status re-status--reserved">Đã đặt cọc</span>',
                'sold'      => '<span class="re-status re-status--sold">Đã bán</span>',
            ];
            echo isset($status_labels[$status]) ? $status_labels[$status] : '—';

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
    $columns['apartment_area']  = 'apartment_area';

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

        case 'apartment_area':

            $query->set('meta_key', 'apartment_area_net');
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
     * Filter apartments by direct building field
     */
    $query->set('meta_query', [[
        'key'     => 'parent_building',
        'value'   => $building_id,
        'compare' => '=',
        'type'    => 'NUMERIC',
    ]]);
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
.column-apartment_floor {
	width: 120px;
}

.column-apartment_building {
	width: 140px;
}

.column-apartment_area {
	width: 110px;
}

.column-apartment_price {
	width: 140px;
}

.column-apartment_status {
	width: 130px;
}

.column-building_floors {
	width: 280px;
}

.column-building_apartments {
	width: 100px;
}

.column-floor_building {
	width: 160px;
}

.column-floor_apartments {
	width: 100px;
}

.column-floor_status {
	width: 130px;
}

.re-status {
	display: inline-block;
	padding: 2px 8px;
	border-radius: 3px;
	font-size: 12px;
	font-weight: 600;
}

.re-status--available {
	background: #dcfce7;
	color: #16a34a;
}

.re-status--reserved {
	background: #fef9c3;
	color: #ca8a04;
}

.re-status--sold {
	background: #fee2e2;
	color: #dc2626;
}

.re-count-badge {
	color: #6b7280;
	font-size: 11px;
}
</style>
<?php
}

/**
 * =========================================================
 * BUILDING COLUMNS
 * =========================================================
 */

/**
 * Add custom columns to building list
 */
add_filter('manage_re_building_posts_columns', 're_building_admin_columns');

function re_building_admin_columns($columns)
{
    $new_columns = [];

    foreach ($columns as $key => $label) {

        $new_columns[$key] = $label;

        if ($key === 'title') {
            $new_columns['building_floors']     = 'Tầng';
            $new_columns['building_apartments'] = 'Căn hộ';
        }
    }

    return $new_columns;
}

/**
 * Render building columns
 */
add_action(
    'manage_re_building_posts_custom_column',
    're_building_admin_columns_content',
    10,
    2
);

function re_building_admin_columns_content($column, $post_id)
{
    switch ($column) {

        /**
         * Floors
         */
        case 'building_floors':

            $floors = get_posts([
                'post_type'      => 're_floor',
                'posts_per_page' => -1,
                'orderby'        => 'title',
                'order'          => 'ASC',
                'fields'         => 'ids',
                'meta_query'     => [[
                    'key'     => 'parent_building',
                    'value'   => $post_id,
                    'compare' => '=',
                    'type'    => 'NUMERIC',
                ]],
            ]);

            if (empty($floors)) {
                echo '—';
                break;
            }

            $total = count($floors);
            $names = array_map('get_the_title', $floors);

            if ($total <= 4) {
                echo esc_html(implode(', ', $names));
            } else {
                $first = array_slice($names, 0, 3);
                $last  = end($names);
                echo esc_html(implode(', ', $first) . ' ... ' . $last);
            }

            echo ' <span class="re-count-badge">(' . $total . ' tầng)</span>';

            break;

        /**
         * Apartment count
         */
        case 'building_apartments':

            $apartments = get_posts([
                'post_type'      => 're_apartment',
                'posts_per_page' => -1,
                'fields'         => 'ids',
                'meta_query'     => [[
                    'key'     => 'parent_building',
                    'value'   => $post_id,
                    'compare' => '=',
                ]],
            ]);

            $count = count($apartments);
            echo $count > 0
                ? '<strong>' . $count . '</strong> căn hộ'
                : '—';

            break;
    }
}

/**
 * =========================================================
 * FLOOR COLUMNS
 * =========================================================
 */

/**
 * Add custom columns to floor list
 */
add_filter('manage_re_floor_posts_columns', 're_floor_admin_columns');

function re_floor_admin_columns($columns)
{
    $new_columns = [];

    foreach ($columns as $key => $label) {

        $new_columns[$key] = $label;

        if ($key === 'title') {
            $new_columns['floor_building']   = 'Tòa nhà';
            $new_columns['floor_apartments'] = 'Căn hộ';
            $new_columns['floor_status']     = 'Trạng thái';
        }
    }

    return $new_columns;
}

/**
 * Render floor columns
 */
add_action(
    'manage_re_floor_posts_custom_column',
    're_floor_admin_columns_content',
    10,
    2
);

function re_floor_admin_columns_content($column, $post_id)
{
    switch ($column) {

        /**
         * Building name
         */
        case 'floor_building':

            $building_id = get_field('parent_building', $post_id);
            echo $building_id ? esc_html(get_the_title($building_id)) : '—';

            break;

        /**
         * Apartment count
         */
        case 'floor_apartments':

            $apartments = get_posts([
                'post_type'      => 're_apartment',
                'posts_per_page' => -1,
                'fields'         => 'ids',
                'meta_query'     => [[
                    'key'     => 'parent_floor',
                    'value'   => $post_id,
                    'compare' => '=',
                    'type'    => 'NUMERIC',
                ]],
            ]);

            $count = count($apartments);
            echo $count > 0
                ? '<strong>' . $count . '</strong> căn hộ'
                : '—';

            break;

        /**
         * Floor status
         */
        case 'floor_status':

            $status = get_field('floor_status', $post_id);
            $status_labels = [
                'available'   => '<span class="re-status re-status--available">Đang mở bán</span>',
                'coming_soon' => '<span class="re-status re-status--reserved">Sắp mở bán</span>',
                'sold_out'    => '<span class="re-status re-status--sold">Đã bán hết</span>',
            ];
            echo isset($status_labels[$status]) ? $status_labels[$status] : '—';

            break;
    }
}

/**
 * =========================================================
 * FLOOR SORTABLE COLUMNS
 * =========================================================
 */

add_filter(
    'manage_edit-re_floor_sortable_columns',
    're_floor_sortable_columns'
);

function re_floor_sortable_columns($columns)
{
    $columns['floor_building']   = 'floor_building';
    $columns['floor_apartments'] = 'floor_apartments';

    return $columns;
}

/**
 * =========================================================
 * FLOOR SORT QUERY
 * =========================================================
 */

add_action('pre_get_posts', 're_floor_admin_orderby');

function re_floor_admin_orderby($query)
{
    if (!is_admin() || !$query->is_main_query()) {
        return;
    }

    $orderby = $query->get('orderby');

    if ($orderby === 'floor_building') {
        $query->set('meta_key', 'parent_building');
        $query->set('orderby', 'meta_value_num');
    }
}

/**
 * =========================================================
 * FLOOR BUILDING FILTER DROPDOWN
 * =========================================================
 */

add_action('restrict_manage_posts', 're_floor_building_filter');

function re_floor_building_filter()
{
    global $typenow;

    if ($typenow !== 're_floor') {
        return;
    }

    $buildings = get_posts([
        'post_type'      => 're_building',
        'posts_per_page' => -1,
        'orderby'        => 'title',
        'order'          => 'ASC',
    ]);

    $selected = isset($_GET['floor_building_filter']) ? absint($_GET['floor_building_filter']) : 0;

?>

<select name="floor_building_filter">

	<option value="">Tất cả tòa nhà</option>

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
 * FLOOR FILTER QUERY BY BUILDING
 * =========================================================
 */

add_action('pre_get_posts', 're_floor_filter_query');

function re_floor_filter_query($query)
{
    global $pagenow;

    if (
        !is_admin()
        || !$query->is_main_query()
        || $pagenow !== 'edit.php'
    ) {
        return;
    }

    if (($_GET['post_type'] ?? '') !== 're_floor') {
        return;
    }

    if (empty($_GET['floor_building_filter'])) {
        return;
    }

    $building_id = absint($_GET['floor_building_filter']);

    $query->set('meta_query', [[
        'key'     => 'parent_building',
        'value'   => $building_id,
        'compare' => '=',
        'type'    => 'NUMERIC',
    ]]);
}