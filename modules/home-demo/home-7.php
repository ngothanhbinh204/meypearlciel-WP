<?php
/**
 * Home Section 7 — Mặt bằng dự án (Interactive Floor Plan)
 * ACF layout: apartment_layout (index 0)
 * Fields: section_title, masterplan_image (array), buildings repeater (building_ref, building_color, building_polygon)
 *
 * Popups (JS-driven, dynamic):
 *   #popup-plan         — building popup shell, nội dung render qua openBuildingPopup(id)
 *   #popup-detail-plan  — apartment detail shell, nội dung render qua JS
 *
 * Image Map Pro: Action = "Run Script" → openBuildingPopup(building_post_id)
 */

$cc_sections   = get_query_var('cc_sections', []);
$data          = $cc_sections['apartment_layout'][0] ?? null;
$section_title = $data['section_title'] ?? '';
$masterplan    = $data['masterplan_image'] ?? null;
$masterplan_url = is_array($masterplan) ? ($masterplan['url'] ?? '') : $masterplan;
?>
<section class="home-7 relative overflow-hidden">
	<div class="vector">
		<img src="<?php echo esc_url(get_template_directory_uri() . '/img/line-home-7.svg'); ?>" alt="">
	</div>
	<div class="image-map-wrapper">
		<?php if ($masterplan_url) : ?>
		<div class="img">
			<!-- Image Map Pro sẽ overlay lên ảnh này — KHÔNG dùng <a> wrapper -->
			<?php echo do_shortcode('[masterplan]'); ?>

		</div>
		<?php endif; ?>
		<?php if ($section_title) : ?>
		<div class="wrap-content">
			<div class="sub-title heading-4 font-bold font-fontHeading" data-aos="fade-right" data-aos-delay="200"
				data-aos-duration="1000">Tổng thể</div>
			<div class="title heading-2 font-fontHeading font-bold uppercase" data-aos="fade-right" data-aos-delay="400"
				data-aos-duration="1000">
				<?php echo esc_html($section_title); ?>
			</div>
		</div>
		<?php endif; ?>
	</div>

	<?php
$buildings     = $data['buildings'] ?? [];

?>
	<?php
	// Lấy tất cả building IDs từ repeater (không trùng)
	$bid_list = [];
	foreach ( $buildings as $row ) {
		$bid = (int) ( $row['building_ref'] ?? 0 );
		if ( $bid && ! in_array( $bid, $bid_list ) ) $bid_list[] = $bid;
	}

	// Query tất cả tầng thuộc các tòa trong section, sắp xếp theo floor_number
	$floor_ids = $bid_list ? get_posts( [
		'post_type'      => 're_floor',
		'posts_per_page' => -1,
		'post_status'    => 'publish',
		'fields'         => 'ids',
		'no_found_rows'  => true,
		'meta_key'       => 'floor_number',
		'orderby'        => 'meta_value_num',
		'order'          => 'ASC',
		'meta_query'     => [ [
			'key'     => 'parent_building',
			'value'   => $bid_list,
			'compare' => 'IN',
			'type'    => 'NUMERIC',
		] ],
	] ) : [];
	?>
	<div class="wrap-floor-tooltip hidden">
		<?php foreach ( $floor_ids as $fid ) :
			$ftitle     = html_entity_decode( get_the_title( $fid ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
			$imp_slug  = re_get_imp_title( $fid );
			$imp_title  = preg_replace( '/\s*[\x{2013}\x{2014}-]\s*/u', '-', $ftitle );			$floor_count = get_field( 'floor_total_count',     $fid );
			$apts_total  = get_field( 'floor_total_apartment', $fid );
			$area        = get_field( 'floor_area',            $fid );
			$status      = get_field( 'floor_status',          $fid );
			$parent_bid  = get_field( 'parent_building',       $fid );
		?>
		<div class="plan-tooltip-wrapper" data-floor-id="<?php echo esc_attr( $fid ); ?>"
			data-building-id="<?php echo esc_attr( is_array( $parent_bid ) ? ( $parent_bid['ID'] ?? 0 ) : $parent_bid ); ?>"
			data-slug="<?php echo esc_attr( $imp_slug ); ?>" data-title="<?php echo esc_attr( $imp_title ); ?>">
			<div class="plan-tooltip-item">
				<img src="<?php echo get_template_directory_uri(); ?>/img/tooltip-arrow.svg" alt=""
					class="tooltip-arrow">
				<div class="tooltip-name heading-5 font-bold"><?php echo esc_html( $ftitle ); ?></div>
				<div class="plan-popup-content">
					<?php if ( $floor_count ) : ?>
					<div class="plan-popup-content-item">
						<div class="plan-popup-content-item-title">Số tầng</div>
						<div class="plan-popup-content-item-value"><?php echo esc_html( $floor_count ); ?></div>
					</div>
					<?php endif; ?>
					<?php if ( $apts_total ) : ?>
					<div class="plan-popup-content-item">
						<div class="plan-popup-content-item-title">Số căn hộ</div>
						<div class="plan-popup-content-item-value"><?php echo esc_html( $apts_total ); ?></div>
					</div>
					<?php endif; ?>
					<?php if ( $area ) : ?>
					<div class="plan-popup-content-item">
						<div class="plan-popup-content-item-title">Diện tích</div>
						<div class="plan-popup-content-item-value"><?php echo esc_html( $area ); ?></div>
					</div>
					<?php endif; ?>
				</div>

			</div>
		</div>
		<?php endforeach; ?>
	</div>
</section>


<!-- ════════════════════════════════════════════════════
     #popup-plan — Building popup shell, nội dung do JS render
     Mở bằng: openBuildingPopup(id) từ Image Map Pro "Run Script"
     ════════════════════════════════════════════════════ -->
<div class="plan-popup" id="popup-plan" style="display: none;" data-fancybox-modal>
	<div class="popup-content">
		<div id="popup-building-header"
			class="title text-center heading-1 font-bold text-Primary-1 font-fontHeading uppercase rem:mb-[33px]"></div>
		<div class="plan-wrapper">
			<div id="popup-floor-tabs" class="wrap-floor"></div>
			<div class="wrap-image-map">
				<div class="img" id="popup-building-plan"></div>
			</div>
			<div id="popup-building-legend" class="plan-legend-list"></div>
		</div>
	</div>
</div>

<!-- Apartment detail popup — JS-populated shells (openApartmentDetail) -->
<div class="plan-popup-detail" id="popup-detail-plan" style="display: none;" data-fancybox-modal>
	<div class="popup-content">
		<div class="wrapper-main flex flex-col lg:flex-row gap-base">
			<!-- Col left: gallery swiper -->
			<div class="col-left xl:rem:max-w-[757px] w-full">
				<div class="wrapper grid md:grid-cols-[calc(627/757*100%)_1fr] gap-[calc(10/805*100%)]">
					<div class="main">
						<div class="swiper js-apt-swiper-main">
							<div class="swiper-wrapper"></div>
						</div>
					</div>
					<div class="thumb relative">
						<div class="relative w-full h-full">
							<div class="swiper js-apt-swiper-thumb">
								<div class="swiper-wrapper"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- Col right: thong tin can ho -->
			<div class="col-right flex-1">
				<div class="wrap-info flex flex-col gap-1">
					<div class="title heading-3 font-bold text-Primary-1 font-fontHeading js-apt-name"></div>
					<div class="js-apt-area"></div>
				</div>
				<div class="facility-list js-apt-facilities"></div>
				<div class="wrap-button-back">
					<a class="btn-back" href="#" data-fancybox-close>
						<div class="icon"><i class="fa-light fa-arrow-left-long"></i></div>
						<span>Quay lại</span>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>