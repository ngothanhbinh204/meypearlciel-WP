<?php
/**
 * Home Section 8 — Bộ sưu tập sắc màu / Gallery Columns
 * ACF layout: gallery (index 0)
 * Fields: title (section heading), gallery_images (array of image objects)
 * Right side: 3 scrolling columns from gallery_images (split into thirds)
 */

$cc_sections  = get_query_var('cc_sections', []);
$data           = $cc_sections['gallery'][0] ?? null;
$title          = $data['title'] ?? '';
$format_content = $data['format_content'] ?? '';
$images         = $data['gallery_images'] ?? [];

// Split gallery images into 3 columns
$col_count   = 3;
$columns     = array_fill(0, $col_count, []);
foreach ($images as $i => $img) {
	$columns[$i % $col_count][] = $img;
}
?>
<section class="home-8 relative overflow-hidden section-py bg-Primary-2">
	<div class="vector">
		<img class="img-svg" src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-home8-embed.svg'); ?>" alt="">
	</div>
	<div class="wrap-container xl:rem:pl-[260px]">
		<div class="wrapper-main grid lg:grid-cols-[calc(480/1573*100%)_1fr] grid-cols-1 gap-base">
			<!-- Left: heading + color list -->
			<div class="col-left xl:pt-20 flex flex-col justify-center">
				<?php if ($title) : ?>
				<div class="title heading-2 font-bold font-fontHeading uppercase text-Secondary-1 mb-2" data-aos="fade-right" data-aos-delay="200" data-aos-duration="1000">
					<?php echo wp_kses_post($title); ?>
				</div>
				<?php endif; ?>
				<?php if ($format_content) : ?>
				<div class="format-content mt-5 body-4 font-normal text-Secondary-1/60" data-aos="fade-right" data-aos-delay="400" data-aos-duration="1000">
					<?php echo wp_kses_post($format_content); ?>
				</div>
				<?php else : ?>
				<div class="format-content mt-5 body-4 font-normal text-Secondary-1/60" data-aos="fade-right" data-aos-delay="400" data-aos-duration="1000">
				</div>
				<?php endif; ?>
			</div>
			<!-- Right: scrolling columns (desktop) -->
			<?php if ($images) : ?>
			<div class="col-right">
				<div class="wrap-slide-desktop hidden lg:grid grid-cols-3 rem:gap-[10px]">
					<?php foreach ($columns as $col_images) : ?>
					<div class="wrap-scroll-container overflow-hidden">
						<div class="scroll-inner">
							<?php foreach ($col_images as $img) : ?>
							<div class="img mb-2">
								<a class="img-ratio ratio:pt-[660_420]" href="#">
									<img class="lozad" data-src="<?php echo esc_url($img['url']); ?>" alt="<?php echo esc_attr($img['alt']); ?>">
								</a>
							</div>
							<?php endforeach; ?>
						</div>
					</div>
					<?php endforeach; ?>
				</div>
				<!-- Mobile: horizontal scroll -->
				<div class="wrap-slide-mobile lg:hidden overflow-x-auto flex gap-3">
					<?php foreach ($images as $img) : ?>
					<div class="img flex-shrink-0 rem:w-[280px]">
						<a class="img-ratio ratio:pt-[660_420]" href="#">
							<img class="lozad" data-src="<?php echo esc_url($img['url']); ?>" alt="<?php echo esc_attr($img['alt']); ?>">
						</a>
					</div>
					<?php endforeach; ?>
				</div>
			</div>
			<?php endif; ?>
		</div>
	</div>
</section>
