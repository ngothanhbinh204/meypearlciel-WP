<?php
/*
Template name: Template - Home
*/

global $post;
// Ensure we have a post ID before proceeding
$post_id = $post->ID ?? get_the_ID();
$banners = get_field('banner_select_page', $post_id);

get_header();
?>

<section class="primary-banner relative z-10 overflow-hidden">
	<div class="banner-container relative">
		<div class="swiper">
			<div class="swiper-wrapper">
				<?php
				// Safety: Check if $banners is an array and not empty
				if (is_array($banners) && !empty($banners)):
					foreach ($banners as $banner_post):
						// Ensure $banner_post is an object/ID
						if (!$banner_post) continue;

						$options = get_field('banner_options', $banner_post->ID);

						// Safety: Skip if the 'banner_options' group is missing
						if (empty($options)) continue;

						// Use null coalescing or empty checks for sub-fields
						$img_desktop = $options['image_desktop'] ?? null;
						$img_mobile  = $options['image_mobile']  ?? null;
						$video_url   = $options['video_file']    ?? null;
						$youtube_url = $options['youtube_url']   ?? null;
						$logo_center = $options['center_logo']   ?? null;
						$logo_right  = $options['center_right']  ?? null;
						$title       = $options['title']         ?? '';
						$form_code   = $options['form_code']     ?? '';
				?>
						<div class="swiper-slide">
							<div class="wrap relative">
								<div
									class="img <?php echo ($youtube_url) ? 'youtube' : ''; ?> <?php echo ($video_url) ? 'video' : ''; ?>">

									<?php if (!empty($youtube_url)):
										$yt = is_array($youtube_url) ? $youtube_url['url'] : $youtube_url;
									?>
										<video class="video-js vjs-default-skin vjs-big-play-centered" controls preload="auto"
											playsinline data-type="youtube" data-src="<?php echo esc_url($yt); ?>">
										</video>

									<?php elseif (!empty($video_url)): ?>
										<video class="video-js vjs-default-skin vjs-big-play-centered" muted controls preload="auto"
											playsinline>
											<source src="<?php echo esc_url($video_url); ?>" type="video/mp4" />
										</video>


									<?php elseif (!empty($img_desktop) && isset($img_desktop['url'])): ?>
										<a>
											<picture>
												<?php if (!empty($img_mobile) && isset($img_mobile['url'])): ?>
													<source media="(max-width: 767px)"
														srcset="<?php echo esc_url($img_mobile['url']); ?>">
												<?php endif; ?>

												<source media="(min-width: 768px)"
													srcset="<?php echo esc_url($img_desktop['url']); ?>">

												<img src="<?php echo esc_url($img_desktop['url']); ?>"
													alt="<?php echo esc_attr($img_desktop['alt'] ?: $title); ?>">
											</picture>
										</a>
									<?php endif; ?>
								</div>

								<?php if ($logo_center || $logo_right || $title || $form_code): ?>
									<div class="animation-grass">
										<div class="grass-front"></div>
										<div class="grass-right"></div>
									</div>
									<div class="animation-tree">
										<div class="moving-tree example1">
											<div class="box"></div>
										</div>
										<div class="moving-tree example2">
											<div class="box"></div>
										</div>
										<div class="moving-tree example3">
											<div class="box"></div>
										</div>
										<div class="moving-tree example4">
											<div class="box"></div>
										</div>
									</div>
									<div class="block-wrap">
										<div class="top-row">
											<?php if (!empty($logo_center) && isset($logo_center['url'])): ?>
												<div class="logo w-fit">
													<a><img src="<?php echo esc_url($logo_center['url']); ?>"
															alt="<?php echo esc_attr($logo_center['alt'] ?: ''); ?>"></a>
													<div class="dash-width-loop with-icon"></div>
												</div>
											<?php endif; ?>

											<?php if (!empty($logo_right) && isset($logo_right['url'])): ?>
												<div class="right-logo">
													<a><img src="<?php echo esc_url($logo_right['url']); ?>"
															alt="<?php echo esc_attr($logo_right['alt'] ?: ''); ?>"></a>
												</div>
											<?php endif; ?>
										</div>

										<div class="bttom-row">
											<?php if (!empty($title)): ?>
												<div class="title-wrap">
													<div class="relative w-fit box-wrap">
														<div class="title"><?php echo wp_kses_post($title); ?></div>
														<div class="dash-width-loop with-icon"></div>
													</div>
												</div>
											<?php endif; ?>

											<?php if (!empty($form_code)): ?>
												<div class="gradient-border">
													<div class="block-form">
														<?php echo do_shortcode($form_code); ?>

<div class="loader">
	<svg fill="#0F5C21" viewBox="0 0 24 24"
		xmlns="http://www.w3.org/2000/svg"><rect x="1" y="6" width="2.8"
			height="12"><animate id="spinner_CcmT" begin="0;spinner_IzZB.end-0.1s"
				attributeName="y" calcMode="spline" dur="0.6s" values="6;1;6"
				keySplines=".36,.61,.3,.98;.36,.61,.3,.98" /><animate
				begin="0;spinner_IzZB.end-0.1s" attributeName="height" calcMode="spline"
				dur="0.6s" values="12;22;12"
				keySplines=".36,.61,.3,.98;.36,.61,.3,.98" /></rect><rect x="5.8" y="6"
			width="2.8" height="12"><animate begin="spinner_CcmT.begin+0.1s"
				attributeName="y" calcMode="spline" dur="0.6s" values="6;1;6"
				keySplines=".36,.61,.3,.98;.36,.61,.3,.98" /><animate
				begin="spinner_CcmT.begin+0.1s" attributeName="height" calcMode="spline"
				dur="0.6s" values="12;22;12"
				keySplines=".36,.61,.3,.98;.36,.61,.3,.98" /></rect><rect x="10.6" y="6"
			width="2.8" height="12"><animate begin="spinner_CcmT.begin+0.2s"
				attributeName="y" calcMode="spline" dur="0.6s" values="6;1;6"
				keySplines=".36,.61,.3,.98;.36,.61,.3,.98" /><animate
				begin="spinner_CcmT.begin+0.2s" attributeName="height" calcMode="spline"
				dur="0.6s" values="12;22;12"
				keySplines=".36,.61,.3,.98;.36,.61,.3,.98" /></rect><rect x="15.4" y="6"
			width="2.8" height="12"><animate begin="spinner_CcmT.begin+0.3s"
				attributeName="y" calcMode="spline" dur="0.6s" values="6;1;6"
				keySplines=".36,.61,.3,.98;.36,.61,.3,.98" /><animate
				begin="spinner_CcmT.begin+0.3s" attributeName="height" calcMode="spline"
				dur="0.6s" values="12;22;12"
				keySplines=".36,.61,.3,.98;.36,.61,.3,.98" /></rect><rect x="20.2" y="6"
			width="2.8" height="12"><animate id="spinner_IzZB"
				begin="spinner_CcmT.begin+0.4s" attributeName="y" calcMode="spline"
				dur="0.6s" values="6;1;6"
				keySplines=".36,.61,.3,.98;.36,.61,.3,.98" /><animate
				begin="spinner_CcmT.begin+0.4s" attributeName="height" calcMode="spline"
				dur="0.6s" values="12;22;12"
				keySplines=".36,.61,.3,.98;.36,.61,.3,.98" /></rect></svg>
</div>
													</div>
												</div>
											<?php endif; ?>
										</div>
									</div>
								<?php endif; ?>
							</div>
						</div>
				<?php
					endforeach;
				endif;
				?>
			</div>
		</div>
	</div>
</section>
<script src="https://unpkg.com/videojs-youtube/dist/Youtube.min.js"></script>
<?php get_footer(); ?>
<script src="https://unpkg.com/videojs-youtube/dist/Youtube.min.js"></script>