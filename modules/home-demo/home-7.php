<?php
/**
 * Home Section 7 — Mặt bằng dự án (Interactive Floor Plan)
 * ACF layout: apartment_layout (index 0)
 * Fields: section_title, masterplan_image (array), buildings repeater (building_ref, building_color, building_polygon)
 *
 * Popups:
 *   #popup-plan-{ID}       — floors of each building (from re_floor CPT)
 *   #popup-detail-plan     — apartment detail (JS-driven, static shell)
 */

$cc_sections   = get_query_var('cc_sections', []);
$data          = $cc_sections['apartment_layout'][0] ?? null;
$section_title = $data['section_title'] ?? '';
$masterplan    = $data['masterplan_image'] ?? null;
$buildings     = $data['buildings'] ?? [];
$masterplan_url = is_array($masterplan) ? ($masterplan['url'] ?? '') : $masterplan;
$first_building_id = !empty($buildings[0]['building_ref']) ? $buildings[0]['building_ref'] : 0;
?>
<section class="home-7 relative overflow-hidden">
	<div class="vector">
		<img src="<?php echo esc_url(get_template_directory_uri() . '/img/line-home-7.svg'); ?>" alt="">
	</div>
	<div class="image-map-wrapper">
		<?php if ($masterplan_url) : ?>
		<div class="img">
			<?php if ($first_building_id) : ?>
			<a href="#popup-plan-<?php echo esc_attr($first_building_id); ?>" data-fancybox>
				<img src="<?php echo esc_url($masterplan_url); ?>" alt="">
			</a>
			<?php else : ?>
			<img src="<?php echo esc_url($masterplan_url); ?>" alt="">
			<?php endif; ?>
		</div>
		<?php endif; ?>
		<?php if ($section_title) : ?>
		<div class="wrap-content">
			<div class="sub-title heading-4 font-bold font-fontHeading" data-aos="fade-right" data-aos-delay="200" data-aos-duration="1000">Tổng thể</div>
			<div class="title heading-2 font-fontHeading font-bold uppercase" data-aos="fade-right" data-aos-delay="400" data-aos-duration="1000">
				<?php echo esc_html($section_title); ?>
			</div>
		</div>
		<?php endif; ?>
	</div>
</section>

<?php
// — Popups: one per building in the buildings repeater
foreach ($buildings as $building_data) :
	$building_id = $building_data['building_ref'] ?? 0;
	if (!$building_id) continue;

	$building_title = get_the_title($building_id);
	$building_color = $building_data['building_color'] ?? '#f97316';

	// Floors for this building (ordered by floor_number)
	$floors = get_posts([
		'post_type'      => 're_floor',
		'posts_per_page' => -1,
		'meta_key'       => 'floor_number',
		'orderby'        => 'meta_value_num',
		'order'          => 'ASC',
		'meta_query'     => [[
			'key'     => 'parent_building',
			'value'   => $building_id,
			'compare' => '=',
		]],
	]);

	// Building masterplan image (from re_building ACF field)
	$building_plan = get_field('masterplan_image', $building_id);
	$building_plan_url = '';
	if (is_array($building_plan)) {
		$building_plan_url = $building_plan['url'] ?? '';
	} elseif (is_string($building_plan)) {
		$building_plan_url = $building_plan;
	}
?>
<div class="plan-popup" id="popup-plan-<?php echo esc_attr($building_id); ?>" style="display: none;" data-fancybox-modal>
	<div class="popup-content">
		<div class="title text-center heading-1 font-bold text-Primary-1 font-fontHeading uppercase rem:mb-[33px]">
			<?php echo esc_html($building_title); ?>
		</div>
		<div class="plan-wrapper">
			<?php if ($floors) : ?>
			<div class="wrap-floor">
				<?php foreach ($floors as $floor) :
					$floor_name   = get_post_meta($floor->ID, 'floor_name', true) ?: $floor->post_title;
					$floor_num    = get_post_meta($floor->ID, 'floor_number', true);
					$floor_num_end = get_post_meta($floor->ID, 'floor_number_end', true);
					$floor_key    = $floor_num_end ? $floor_num . '-' . $floor_num_end : $floor_num;
				?>
				<div class="floor-item" data-floor="<?php echo esc_attr($floor_key); ?>">
					<?php echo esc_html($floor_name); ?>
				</div>
				<?php endforeach; ?>
			</div>
			<?php endif; ?>

			<?php if ($building_plan_url) : ?>
			<div class="wrap-image-map">
				<div class="img">
					<a class="img-ratio ratio:pt-[550_960]" href="#popup-detail-plan" data-fancybox>
						<img class="lozad" data-src="<?php echo esc_url($building_plan_url); ?>" alt="">
					</a>
				</div>
			</div>
			<?php endif; ?>

			<div class="plan-legend-list">
				<div class="plan-legend-item">
					<div class="plan-legend-item-color" style="background-color: <?php echo esc_attr($building_color); ?>"></div>
					<div class="plan-legend-item-name"><?php echo esc_html($building_title); ?></div>
				</div>
			</div>
		</div>
	</div>
</div>
<?php endforeach; ?>

<!-- Apartment detail popup — content populated by JS -->
<div class="plan-popup-detail" id="popup-detail-plan" style="display: none;" data-fancybox-modal>
	<div class="popup-content">
		<div class="wrapper-main flex flex-col lg:flex-row gap-base">
			<div class="col-left xl:rem:max-w-[757px] w-full">
				<div class="wrapper grid md:grid-cols-[calc(627/757*100%)_1fr] gap-[calc(10/805*100%)]">
					<div class="main">
						<div class="swiper">
							<div class="swiper-wrapper"></div>
						</div>
					</div>
					<div class="thumb relative">
						<div class="relative w-full h-full">
							<div class="swiper">
								<div class="swiper-wrapper"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="col-right flex-1">
				<div class="wrap-info flex flex-col gap-1">
					<div class="title heading-3 font-bold text-Primary-1 font-fontHeading js-apt-title"></div>
					<div class="info-item text-Primary-4 font-normal js-apt-area"></div>
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
