<?php
/**
 * Home Section 2 — Welcome / Story Swiper
 * ACF layout: welcome — slides repeater
 * slide_type: 'welcome' → section-welcome (title, sub_title, image, inner_title, description, title_right)
 * slide_type: 'about'   → section-about  (image, description, image_right)
 */

$cc_sections = get_query_var('cc_sections', []);
$data        = $cc_sections['welcome'][0] ?? null;
$slides      = $data['slides'] ?? [];
?>
<section class="home-2 relative overflow-hidden">
	<div class="swiper-column-auto relative swiper-loop autoplay auto-height" data-speed="700" data-time="5000">
		<div class="swiper">
			<div class="swiper-wrapper">
				<?php foreach ($slides as $slide) :
					$slide_type        = $slide['slide_type'] ?? 'welcome';
					$slide_title       = $slide['title'] ?? '';
					$slide_sub_title   = $slide['sub_title'] ?? '';
					$slide_image       = $slide['image'] ?? null;				$slide_video       = $slide['slide_video'] ?? '';					$slide_desc        = $slide['description'] ?? '';
					$slide_inner_title = $slide['inner_title'] ?? '';
					$slide_title_right = $slide['title_right'] ?? '';
					$slide_image_right = $slide['image_right'] ?? null;
				?>
				<div class="swiper-slide">
					<?php if ($slide_type === 'about') : ?>
					<div class="section-about xl:rem:pt-[180px] relative overflow-hidden">
						<div class="vector">
							<img class="img-svg"
								src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-home-2-welcome.svg'); ?>"
								alt="">
						</div>
						<div class="vector-mobile mobile-show">
							<img class="img-svg"
								src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-home-2-welcome-mobile.svg'); ?>"
								alt="">
						</div>
						<div class="wrap-container xl:pl-25 xl:rem:px-[160px] px-4 h-full">
							<div
								class="wrapper-main grid lg:grid-cols-[calc(627/1600*100%)_1fr] grid-cols-1 xl:rem:gap-[273px] gap-4 h-full">
								<div class="col-left">
									<?php if ($slide_video || $slide_image) : ?>
									<div class="item">
										<div class="img">

											<?php if ($slide_video) : ?>

											<?php
			$is_yt = preg_match(
				'/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i',
				$slide_video,
				$yt_m
			);
			?>

											<?php if ($is_yt) : ?>

											<div class="img-ratio ratio:pt-[360_627]">

												<iframe
													src="https://www.youtube.com/embed/<?php echo esc_attr($yt_m[1]); ?>?autoplay=1&mute=1&controls=0&loop=1&playlist=<?php echo esc_attr($yt_m[1]); ?>&playsinline=1"
													frameborder="0" allow="autoplay; encrypted-media" allowfullscreen
													style="position:absolute;top:0;left:0;width:100%;height:100%;">
												</iframe>

											</div>

											<?php else : ?>

											<div class="img-ratio ratio:pt-[360_627]">

												<video src="<?php echo esc_url($slide_video); ?>" autoplay muted loop
													playsinline preload="auto"
													style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;">
												</video>

											</div>

											<?php endif; ?>

											<?php else : ?>

											<a class="img-ratio ratio:pt-[360_627]" href="#">
												<img class="lozad"
													data-src="<?php echo esc_url($slide_image['url']); ?>"
													alt="<?php echo esc_attr($slide_image['alt']); ?>">
											</a>

											<?php endif; ?>

										</div>
									</div>
									<?php endif; ?>
								</div>
								<div class="col-right">
									<div class="wrapper flex items-center gap-5 xl:rem:mt-[126px]">
										<?php if ($slide_desc) : ?>
										<div class="desc rem:max-w-[240px] w-full body-4 font-normal text-Primary-1">
											<?php echo wp_kses_post($slide_desc); ?>
										</div>
										<?php endif; ?>
										<?php if ($slide_image_right) : ?>
										<div class="img flex-1">
											<a class="img-ratio ratio:pt-[650_440]" href="#">
												<img class="lozad"
													data-src="<?php echo esc_url($slide_image_right['url']); ?>"
													alt="<?php echo esc_attr($slide_image_right['alt']); ?>">
											</a>
										</div>
										<?php endif; ?>
									</div>
								</div>
							</div>
						</div>
					</div>
					<?php else : // welcome (default) ?>
					<div class="section-welcome xl:pt-25 pb-10 py-10 relative overflow-hidden">
						<div class="vector" aria-hidden="true">
							<img class="img-svg"
								src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-home-2-welcome.svg'); ?>"
								alt="">
						</div>
						<div class="wrap-content rem:max-w-[1010px] px-4 w-full mx-auto text-Secondary-1">
							<?php if ($slide_title || $slide_sub_title) : ?>
							<div class="wrap-heading text-center mb-base title-fade-left">
								<?php if ($slide_title) : ?>
								<h2 class="title font-fontHeading font-bold heading-2 uppercase bottom-title">
									<?php echo esc_html($slide_title); ?>
								</h2>
								<?php endif; ?>
								<?php if ($slide_sub_title) : ?>
								<div class="sub-title heading-hightlight font-secondary font-normal" data-aos="fade-up"
									data-aos-delay="400" data-aos-duration="1000">
									<?php echo esc_html($slide_sub_title); ?>
								</div>
								<?php endif; ?>
							</div>
							<?php endif; ?>
							<?php if ($slide_video || $slide_image) : ?>
							<div class="item xl:rem:max-w-[627px] w-full mx-auto mb-base">
								<div class="img">
									<?php if ($slide_video) : ?>
									<?php $is_yt = preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i', $slide_video, $yt_m); ?>
									<?php if ($is_yt) : ?>
									<div class="img-ratio ratio:pt-[360_627]">
										<iframe src="https://www.youtube.com/embed/<?php echo esc_attr($yt_m[1]); ?>"
											frameborder="0" allowfullscreen
											style="position:absolute;top:0;left:0;width:100%;height:100%;"></iframe>
									</div>
									<?php else : ?>
									<div class="img-ratio ratio:pt-[360_627]">
										<video src="<?php echo esc_url($slide_video); ?>" autoplay muted playsinline
											style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;"></video>
									</div>
									<?php endif; ?>
									<?php else : ?>
									<a class="img-ratio ratio:pt-[360_627]" href="#">
										<img class="lozad" data-src="<?php echo esc_url($slide_image['url']); ?>"
											alt="<?php echo esc_attr($slide_image['alt']); ?>">
									</a>
									<?php endif; ?>
								</div>
							</div>
							<?php endif; ?>
							<?php if ($slide_inner_title || $slide_desc || $slide_title_right) : ?>
							<div class="wrap-inner flex md:flex-row flex-col xl:rem:max-w-[680px] gap-5 w-full mx-auto">
								<?php if ($slide_inner_title || $slide_desc) : ?>
								<div class="col-left rem:max-w-[387px] w-full">
									<?php if ($slide_inner_title) : ?>
									<div
										class="item-inner-title xl:rem:text-[72px] rem:text-[48px] font-fontHeading font-bold uppercase mb-3">
										<?php echo esc_html($slide_inner_title); ?>
									</div>
									<?php endif; ?>
									<?php if ($slide_desc) : ?>
									<div class="desc body-4 font-normal">
										<?php echo wp_kses_post($slide_desc); ?>
									</div>
									<?php endif; ?>
								</div>
								<?php endif; ?>
								<?php if ($slide_title_right) : ?>
								<div class="col-right flex-1 title-fade-left">
									<div
										class="title-right xl:rem:text-[128px] rem:text-[80px] font-fontHeading font-bold uppercase text-Primary-3 bottom-title">
										<?php echo esc_html($slide_title_right); ?>
									</div>
								</div>
								<?php endif; ?>
							</div>
							<?php endif; ?>
						</div>
					</div>
					<?php endif; ?>
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