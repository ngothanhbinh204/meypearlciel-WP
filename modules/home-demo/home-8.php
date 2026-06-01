<?php
/**
 * Home Section 8 — Bộ sưu tập sắc màu / Gallery Columns
 * ACF layout: gallery (index 0)
 * Fields: title (wysiwyg), format_content (wysiwyg)
 *         gallery_featured (image)       — col-1 poster image
 *         gallery_featured_video (url)   — col-1 inline video (MP4/YouTube/Vimeo)
 *         gallery_col2 (gallery)         — col-2 scrolling images
 *         gallery_col3 (gallery)         — col-3 scrolling images
 */

$cc_sections       = get_query_var('cc_sections', []);
$data              = $cc_sections['gallery'][0] ?? null;
$title             = $data['title'] ?? '';
$format_content    = $data['format_content'] ?? '';
$featured_image    = $data['gallery_featured'] ?? null;
$featured_video    = $data['gallery_featured_video'] ?? '';
$col2_images       = $data['gallery_col2'] ?? [];
$col3_images       = $data['gallery_col3'] ?? [];
$all_images        = array_merge(
	$featured_image ? [$featured_image] : [],
	$col2_images,
	$col3_images
);

// Detect video type
$video_type = '';
$video_embed_url = '';
if ( $featured_video ) {
	if ( preg_match( '/youtube\.com|youtu\.be/', $featured_video ) ) {
		$video_type = 'youtube';
		preg_match( '/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/', $featured_video, $yt_match );
		if ( ! empty( $yt_match[1] ) ) {
			$video_embed_url = 'https://www.youtube.com/embed/' . $yt_match[1] . '?autoplay=1&rel=0&playsinline=1';
		}
	} elseif ( preg_match( '/vimeo\.com/', $featured_video ) ) {
		$video_type = 'vimeo';
		preg_match( '/vimeo\.com\/(?:video\/)?([0-9]+)/', $featured_video, $vm_match );
		if ( ! empty( $vm_match[1] ) ) {
			$video_embed_url = 'https://player.vimeo.com/video/' . $vm_match[1] . '?autoplay=1&playsinline=1';
		}
	} else {
		$video_type = 'mp4';
		$video_embed_url = esc_url( $featured_video );
	}
}
?>
<section id="home-8" class="home-8 relative overflow-hidden bg-Secondary-1">
	<div class="vector" aria-hidden="true">
		<img class="img-svg" src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-home8-embed.svg'); ?>"
			alt="">
	</div>
	<div class="vector-mobile mobile-show" aria-hidden="true"><img class="img-svg"
			src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-home-group-embed-mobile.svg'); ?>" alt="">
	</div>
	<div class="wrap-container xl:rem:pl-[260px] xl:rem:pr-[87px] px-4">
		<div class="wrapper-main grid lg:grid-cols-[calc(480/1573*100%)_1fr] grid-cols-1 xl:rem:gap-[113px] gap-base">
			<!-- Left: heading + colour list -->
			<div class="col-left xl:rem:pt-[107px] pt-10">
				<?php if ($title) : ?>
				<div class="title heading-2 font-bold uppercase text-Primary-1 font-fontHeading" data-aos="fade-right"
					data-aos-delay="200" data-aos-duration="700">
					<?php echo wp_kses_post($title); ?>
				</div>
				<?php endif; ?>
				<?php if ($format_content) : ?>
				<div class="format-content mt-5 body-4 text-Primary-1 font-normal" data-aos="fade-right"
					data-aos-delay="600" data-aos-duration="700">
					<?php echo wp_kses_post($format_content); ?>
				</div>
				<?php endif; ?>
			</div>
			<!-- Right: 3-column scroll layout -->
			<?php if ($featured_image || $col2_images || $col3_images) : ?>
			<div class="col-right overflow-hidden lg:rem:h-[864px] h-full relative">
				<!-- Desktop -->
				<div
					class="wrap-slide-desktop home-item-animation absolute top-0 left-0 w-full h-full hidden lg:grid grid-cols-3 rem:gap-[10px] overflow-hidden min-h-[36rem]">
					<!-- Col 1: featured image/video with play icon -->
					<div class="wrap-scroll-container flex flex-col justify-center">
						<?php if ($featured_image || $featured_video) : ?>
						<div class="img relative home8-featured-wrap" <?php if ($featured_video) : ?>
							data-video-type="<?php echo esc_attr($video_type); ?>"
							data-video-src="<?php echo esc_attr($video_embed_url); ?>" <?php endif; ?>>

							<?php if ($featured_video) : ?>

							<div class="img-ratio ratio:pt-[427_320] home8-featured-video">
								<video src="<?php echo esc_url($featured_video); ?>" autoplay muted loop playsinline>
								</video>
							</div>

							<div class="wrap-play-icon absolute-center home8-play-btn">
								<div class="play-icon">
									<button type="button" aria-label="Phát video">
										<span class="material-symbols-outlined">play_arrow</span>
									</button>
								</div>
							</div>

							<?php elseif ($featured_image) : ?>

							<div class="img-ratio ratio:pt-[427_320] home8-featured-poster">
								<img class="lozad" data-src="<?php echo esc_url($featured_image['url']); ?>"
									alt="<?php echo esc_attr($featured_image['alt']); ?>">
							</div>

							<?php endif; ?>

						</div>
						<?php endif; ?>
					</div>
					<!-- Col 2: scrolling images -->
					<div class="wrap-scroll-container">
						<div class="wrap-spacing">
							<div class="scroll-container">
								<?php foreach ($col2_images as $img) : ?>
								<div class="item">
									<img class="lozad" data-src="<?php echo esc_url($img['url']); ?>"
										alt="<?php echo esc_attr($img['alt']); ?>">
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
									<img class="lozad" data-src="<?php echo esc_url($img['url']); ?>"
										alt="<?php echo esc_attr($img['alt']); ?>">
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
							<img class="lozad" data-src="<?php echo esc_url($img['url']); ?>"
								alt="<?php echo esc_attr($img['alt']); ?>">
						</div>
						<?php endforeach; ?>
					</div>
				</div>
			</div>
			<?php endif; ?>
		</div>
	</div>
</section>