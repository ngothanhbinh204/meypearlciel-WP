<?php
/**
 * Home Section 8 — Bộ sưu tập sắc màu / Gallery Columns
 * ACF layout: gallery (index 0)
 * Fields: title (wysiwyg), format_content (wysiwyg)
 *         gallery_featured (image) — col-1 featured + play icon
 *         gallery_col2 (gallery)   — col-2 scrolling images
 *         gallery_col3 (gallery)   — col-3 scrolling images
 */

$cc_sections    = get_query_var('cc_sections', []);
$data           = $cc_sections['gallery'][0] ?? null;
$title          = $data['title'] ?? '';
$format_content = $data['format_content'] ?? '';
$featured_image = $data['gallery_featured'] ?? null;
$col2_images    = $data['gallery_col2'] ?? [];
$col3_images    = $data['gallery_col3'] ?? [];
$all_images     = array_merge(
	$featured_image ? [$featured_image] : [],
	$col2_images,
	$col3_images
);
?>
<section class="home-8 relative overflow-hidden bg-Secondary-1">
	<div class="vector" aria-hidden="true">
		<img class="img-svg" src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-home8-embed.svg'); ?>" alt="">
	</div>
	<div class="wrap-container xl:rem:pl-[260px] xl:rem:pr-[87px] px-4">
		<div class="wrapper-main grid lg:grid-cols-[calc(480/1573*100%)_1fr] grid-cols-1 xl:rem:gap-[113px] gap-base">
			<!-- Left: heading + colour list -->
			<div class="col-left xl:rem:pt-[107px] pt-10">
				<?php if ($title) : ?>
				<div class="title heading-2 font-bold uppercase text-Primary-1 font-fontHeading" data-aos="fade-right" data-aos-delay="200" data-aos-duration="700">
					<?php echo wp_kses_post($title); ?>
				</div>
				<?php endif; ?>
				<?php if ($format_content) : ?>
				<div class="format-content mt-5 body-4 text-Primary-1 font-normal" data-aos="fade-right" data-aos-delay="600" data-aos-duration="700">
					<?php echo wp_kses_post($format_content); ?>
				</div>
				<?php endif; ?>
			</div>
			<!-- Right: 3-column scroll layout -->
			<?php if ($featured_image || $col2_images || $col3_images) : ?>
			<div class="col-right overflow-hidden lg:rem:h-[864px] h-full relative">
				<!-- Desktop -->
				<div class="wrap-slide-desktop home-item-animation absolute top-0 left-0 w-full h-full hidden lg:grid grid-cols-3 rem:gap-[10px] overflow-hidden min-h-[36rem]">
					<!-- Col 1: featured image with play icon -->
					<div class="wrap-scroll-container flex flex-col justify-center">
						<?php if ($featured_image) : ?>
						<div class="img relative">
							<a class="img-ratio ratio:pt-[427_320]" href="#">
								<img class="lozad" data-src="<?php echo esc_url($featured_image['url']); ?>" alt="<?php echo esc_attr($featured_image['alt']); ?>">
							</a>
							<div class="wrap-play-icon absolute-center">
								<div class="play-icon">
									<a href="#"><span class="material-symbols-outlined">play_arrow</span></a>
								</div>
							</div>
						</div>
						<?php endif; ?>
					</div>
					<!-- Col 2: scrolling images -->
					<div class="wrap-scroll-container">
						<div class="wrap-spacing">
							<div class="scroll-container">
								<?php foreach ($col2_images as $img) : ?>
								<div class="item">
									<img class="lozad" data-src="<?php echo esc_url($img['url']); ?>" alt="<?php echo esc_attr($img['alt']); ?>">
								</div>
								<?php endforeach; ?>
							</div>
						</div>
					</div>
					<!-- Col 3: scrolling images -->
					<div class="wrap-scroll-container">
						<div class="wrap-spacing">
							<div class="scroll-container">
								<?php foreach ($col3_images as $img) : ?>
								<div class="item">
									<img class="lozad" data-src="<?php echo esc_url($img['url']); ?>" alt="<?php echo esc_attr($img['alt']); ?>">
								</div>
								<?php endforeach; ?>
							</div>
						</div>
					</div>
				</div>
				<!-- Mobile: single scroll -->
				<div class="wrap-slide-mobile lg:hidden">
					<div class="scroll-container">
						<?php foreach ($all_images as $img) : ?>
						<div class="item">
							<img class="lozad" data-src="<?php echo esc_url($img['url']); ?>" alt="<?php echo esc_attr($img['alt']); ?>">
						</div>
						<?php endforeach; ?>
					</div>
				</div>
			</div>
			<?php endif; ?>
		</div>
	</div>
</section>
