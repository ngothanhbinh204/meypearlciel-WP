<?php
/**
 * Home Section 2 — Welcome / Story Swiper
 * ACF layout: welcome — slides repeater (title, image, description wysiwyg)
 */

$cc_sections = get_query_var('cc_sections', []);
$data        = $cc_sections['welcome'][0] ?? null;
$slides      = $data['slides'] ?? [];
?>
<section class="home-2 relative overflow-hidden">
	<div class="swiper-column-auto relative swiper-loop auto-height" data-speed="700">
		<div class="swiper">
			<div class="swiper-wrapper">
				<?php foreach ($slides as $slide) :
					$slide_title = $slide['title'] ?? '';
					$slide_image = $slide['image'] ?? null;
					$slide_desc  = $slide['description'] ?? '';
				?>
				<div class="swiper-slide">
					<div class="section-welcome xl:pt-25 pb-10 py-10 relative overflow-hidden">
						<div class="vector" aria-hidden="true">
							<img class="img-svg"
								src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-home-2-welcome.svg'); ?>"
								alt="">
						</div>
						<div class="wrap-content rem:max-w-[1010px] px-4 w-full mx-auto text-Secondary-1">
							<?php if ($slide_title) : ?>
							<div class="wrap-heading text-center mb-base">
								<h2 class="title font-fontHeading font-bold heading-2 uppercase" data-aos="fade-up"
									data-aos-delay="200" data-aos-duration="1000">
									<?php echo esc_html($slide_title); ?>
								</h2>
							</div>
							<?php endif; ?>
							<?php if ($slide_image) : ?>
							<div class="item xl:rem:max-w-[627px] w-full mx-auto mb-base">
								<div class="img">
									<a class="img-ratio ratio:pt-[360_627]" href="#">
										<img class="lozad" data-src="<?php echo esc_url($slide_image['url']); ?>"
											alt="<?php echo esc_attr($slide_image['alt']); ?>">
									</a>
								</div>
							</div>
							<?php endif; ?>
							<?php if ($slide_desc) : ?>
							<div class="wrap-inner xl:rem:max-w-[680px] w-full mx-auto">
								<div class="format-content body-4 font-normal">
									<?php echo wp_kses_post($slide_desc); ?>
								</div>
							</div>
							<?php endif; ?>
						</div>
					</div>
				</div>
				<?php endforeach; ?>
			</div>
		</div>
		<div class="arrow-button flex-center pb-10 rem:gap-[14px]">
			<div class="btn btn-sw-1 btn-prev"><img class="img-svg"
					src="<?php echo esc_url(get_template_directory_uri() . '/img/arrow-left.svg'); ?>" alt=""></div>
			<div class="btn btn-sw-1 btn-next"><img class="img-svg"
					src="<?php echo esc_url(get_template_directory_uri() . '/img/arrow-right.svg'); ?>" alt=""></div>
		</div>
	</div>
</section>
?>
<section class="home-2 relative overflow-hidden">
	<div class="swiper-column-auto relative swiper-loop auto-height" data-speed="700">
		<div class="swiper">
			<div class="swiper-wrapper">
				<div class="swiper-slide">
					<div class="section-welcome xl:pt-25 pb-10 py-10 relative overflow-hidden">
						<div class="vector" aria-hidden="true">
							<img class="img-svg"
								src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-home-2-welcome.svg'); ?>"
								alt="">
						</div>
						<div class="wrap-content rem:max-w-[1010px] px-4 w-full mx-auto text-Secondary-1">
							<?php if ($title) : ?>
							<div class="wrap-heading text-center mb-base">
								<h2 class="title font-fontHeading font-bold heading-2 uppercase" data-aos="fade-up"
									data-aos-delay="200" data-aos-duration="1000">
									<?php echo esc_html($title); ?>
								</h2>
							</div>
							<?php endif; ?>
							<?php if ($image) : ?>
							<div class="item xl:rem:max-w-[627px] w-full mx-auto mb-base">
								<div class="img">
									<a class="img-ratio ratio:pt-[360_627]" href="#">
										<img class="lozad" data-src="<?php echo esc_url($image['url']); ?>"
											alt="<?php echo esc_attr($image['alt']); ?>">
									</a>
								</div>
							</div>
							<?php endif; ?>
							<?php if ($description) : ?>
							<div class="wrap-inner xl:rem:max-w-[680px] w-full mx-auto">
								<div class="format-content body-4 font-normal">
									<?php echo wp_kses_post($description); ?>
								</div>
							</div>
							<?php endif; ?>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="arrow-button flex-center pb-10 rem:gap-[14px]">
			<div class="btn btn-sw-1 btn-prev"><img class="img-svg"
					src="<?php echo esc_url(get_template_directory_uri() . '/img/arrow-left.svg'); ?>" alt=""></div>
			<div class="btn btn-sw-1 btn-next"><img class="img-svg"
					src="<?php echo esc_url(get_template_directory_uri() . '/img/arrow-right.svg'); ?>" alt=""></div>
		</div>
	</div>
</section>