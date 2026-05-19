<?php
/**
 * Home Section 1 — Hero Banner
 * ACF layout: hero_banner (index 0)
 */

$cc_sections = get_query_var('cc_sections', []);
$data        = $cc_sections['hero_banner'][0] ?? null;
$image       = $data['image'] ?? null;
$cta_url     = $data['cta_url'] ?? '#';
$socials     = get_field('header_social_links', 'options') ?: [];
?>
<section class="home-1">
	<div class="slide relative">
		<div class="swiper">
			<div class="swiper-wrapper">
				<?php if ($image) : ?>
				<div class="swiper-slide">
					<div class="home-1-banner relative">
						<a class="img-ratio ratio:pt-[960_1920]" href="<?php echo esc_url($cta_url); ?>">
							<img class="lozad" data-src="<?php echo esc_url($image['url']); ?>"
								alt="<?php echo esc_attr($image['alt']); ?>">
						</a>
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