<?php
/**
 * Home Section 1 — Hero Banner
 * ACF layout: hero_banner (index 0)
 */

$cc_sections  = get_query_var('cc_sections', []);
$data         = $cc_sections['hero_banner'][0] ?? null;
$image        = $data['image'] ?? null;
$video_file	= $data['video_file'] ?? null;
$mobile_image = $data['mobile_image'] ?? null;
$socials      = get_field('header_social_links', 'options') ?: [];
?>
<section class="home-1" id="home-1">
	<div class="slide relative">
		<div class="swiper">
			<div class="swiper-wrapper">

				<?php if ($video_file) : ?>
				<div class="swiper-slide">
					<div class="home-1-banner relative">
						<a class="img-ratio ratio:pt-[960_1920]" href="#" >
							<video class="hero-video w-full h-full object-cover" autoplay playsinline muted
								preload="metadata">
								<source src="<?php echo esc_url($video_file); ?>" type="video/mp4">
							</video>
						</a>
					</div>
				</div>
				<?php endif; ?>
				<?php if ($image) : ?>
				<div class="swiper-slide">
					<div class="home-1-banner relative">
						<div class="banner-desktop desktop-show">
							<a class="img-ratio ratio:pt-[960_1920] <?php echo $mobile_image ? : ''; ?>">
								<img class="lozad" data-src="<?php echo esc_url($image['url']); ?>"
									alt="<?php echo esc_attr($image['alt']); ?>">
							</a>
						</div>

						<?php if ($mobile_image) : ?>
						<div class="banner-mobile mobile-show">
							<a>
								<img class="lozad" data-src="<?php echo esc_url($mobile_image['url']); ?>"
									alt="<?php echo esc_attr($mobile_image['alt']); ?>">
							</a>
						</div>
						<?php endif; ?>
					</div>
				</div>
				<?php endif; ?>




			</div>
		</div>
		<div class="scroll-down absolute left-2/4 -translate-x-2/4 bottom-0 z-2 flex flex-col">
			<div class="text-scroll -rotate-90 mb-12 text-white body-14 font-normal">CUỘN XUỐNG</div>
			<div class="time-line flex-center" aria-hidden="true">
				<img class="img-svg"
					src="<?php echo esc_url(get_template_directory_uri() . '/img/time-line-embed.svg'); ?>" alt="">
			</div>
		</div>
		<?php if ($socials) : ?>
		<div class="social-lists absolute md:left-25 left-0 bottom-15 z-2">
			<ul>
				<?php foreach ($socials as $item) : ?>
				<li>
					<a href="<?php echo esc_url($item['social_url']); ?>" target="_blank" rel="noopener noreferrer">
						<i class="<?php echo esc_attr($item['social_icon']); ?>"></i>
					</a>
				</li>
				<?php endforeach; ?>
			</ul>
		</div>
		<?php endif; ?>
	</div>
	<div class="wrap-button-slide">
		<div class="btn btn-sw-1 btn-prev"><img class="img-svg"
				src="<?php echo esc_url(get_template_directory_uri() . '/img/arrow-left.svg'); ?>" alt=""></div>
		<div class="btn btn-sw-1 btn-next"><img class="img-svg"
				src="<?php echo esc_url(get_template_directory_uri() . '/img/arrow-right.svg'); ?>" alt=""></div>
	</div>
</section>