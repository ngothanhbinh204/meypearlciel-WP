<?php
/**
 * Home Section 5 — Hệ tiện ích ALL IN ONE
 * ACF layout: utilities_all_in_one (index 0)
 * Fields: section_title, section_description, masterplan_image (url), floor_groups repeater
 * floor_groups sub-fields: floor_name, floor_code, amenities repeater (amenity_name, amenity_description)
 */

$cc_sections  = get_query_var('cc_sections', []);
$data         = $cc_sections['utilities_all_in_one'][0] ?? null;
$section_title = $data['section_title'] ?? '';
$description  = $data['section_description'] ?? '';
$masterplan   = $data['masterplan_image'] ?? '';
$floor_groups = $data['floor_groups'] ?? [];
?>
<section class="home-5 section-swiper relative overflow-hidden">
	<div class="vector-1"><img src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-h-5-1.svg'); ?>" alt=""></div>
	<div class="vector-2"><img src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-h-5-2.svg'); ?>" alt=""></div>
	<div class="image-map-wrapper">
		<?php if ($masterplan) : ?>
		<div class="img"><img src="<?php echo esc_url($masterplan); ?>" alt=""></div>
		<?php endif; ?>
		<div class="bg-overlay"></div>
	</div>
	<div class="section-amenity-wrapper">
		<div class="wrap-inner xl:mb-16 mb-base text-white">
			<div class="sub heading-4 font-fontHeading font-bold text-Primary-3" data-aos="fade-right" data-aos-delay="200" data-aos-duration="700">Hệ tiện ích</div>
			<?php if ($section_title) : ?>
			<div class="title heading-2 font-fontHeading font-bold uppercase mb-1" data-aos="fade-right" data-aos-delay="400" data-aos-duration="700">
				<?php echo esc_html($section_title); ?>
			</div>
			<?php endif; ?>
			<?php if ($description) : ?>
			<div class="ctn body-3 font-normal" data-aos="fade-right" data-aos-delay="600" data-aos-duration="700">
				<p><?php echo esc_html($description); ?></p>
			</div>
			<?php endif; ?>
		</div>
		<?php if ($floor_groups) : ?>
		<div class="amenity-legend-wrap mt-7" data-aos="fade-right" data-aos-delay="800" data-aos-duration="700">
			<div class="wrap-item-toggle flex flex-col gap-3">
				<?php foreach ($floor_groups as $group) : ?>
				<div class="item-toggle group transition-300">
					<div class="title flex items-center justify-between cursor-pointer transition-300">
						<div class="toggle-wrapper flex items-center gap-5">
							<div class="floor body-3 font-semibold text-Primary-3 font-fontHeading">
								<?php echo esc_html($group['floor_name']); ?>
							</div>
						</div>
						<i class="fa-light fa-plus text-xl ml-auto transition-300 text-white"></i>
					</div>
					<?php if (!empty($group['amenities'])) : ?>
					<div class="content" style="display: none;">
						<div class="amenity-legend-list">
							<?php foreach ($group['amenities'] as $i => $amenity) : ?>
							<a class="amenity-legend-item" href="#">
								<div class="amenity-legend-item-number"><span><?php echo ($i + 1); ?></span></div>
								<div class="amenity-legend-item-text"><?php echo esc_html($amenity['amenity_name']); ?></div>
							</a>
							<?php endforeach; ?>
						</div>
					</div>
					<?php endif; ?>
				</div>
				<?php endforeach; ?>
			</div>
		</div>
		<?php endif; ?>
	</div>
</section>
