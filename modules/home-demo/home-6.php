<?php
/**
 * Home Section 6 — Lifestyle Experience Swiper
 * ACF layout: lifestyle
 * utility_items sub-fields: image_left (url), name, sub_title, description (wysiwyg), image_right (url)
 */

$cc_sections   = get_query_var('cc_sections', []);
$data          = $cc_sections['lifestyle'][0] ?? null;
$utility_items = $data['utility_items'] ?? [];
?>
<section class="home-6 relative overflow-hidden">
	<div class="swiper-column-auto relative" data-speed="700">
		<div class="swiper">
			<div class="swiper-wrapper">
				<?php foreach ($utility_items as $item) :
					$img_left  = $item['image_left'] ?? '';
					$img_right = $item['image_right'] ?? '';
					$name      = $item['name'] ?? '';
					$sub_title = $item['sub_title'] ?? '';
					$desc      = $item['description'] ?? '';
				?>
				<div class="swiper-slide bg-Secondary-1 pt-10 xl:pb-25 pb-10">
					<div class="vector">
						<img class="img-svg" src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-home6-embed.svg'); ?>" alt="">
					</div>
					<div class="wrap-container xl:rem:pl-[160px] xl:pr-20 px-4">
						<div class="wrapper-main grid lg:grid-cols-[calc(884/1680*100%)_1fr] grid-cols-1 gap-4 xl:rem:gap-[146px]">
							<div class="col-left">
								<div class="wrap-left grid lg:grid-cols-[calc(450/884*100%)_1fr] xl:rem:gap-[47px] xl:rem:mt-[200px] gap-5">
									<?php if ($img_left) : ?>
									<div class="img">
										<a class="img-ratio ratio:pt-[580_450]" href="#">
											<img class="lozad" data-src="<?php echo esc_url($img_left); ?>" alt="<?php echo esc_attr($name); ?>">
										</a>
									</div>
									<?php endif; ?>
									<div class="content">
										<?php if ($name) : ?>
										<div class="title heading-2 font-fontHeading font-bold uppercase mb-2 text-Primary-1">
											<?php echo esc_html($name); ?>
										</div>
										<?php endif; ?>
										<?php if ($sub_title) : ?>
										<div class="sub-title heading-hightlight font-normal text-Primary-1 font-secondary mb-6">
											<?php echo esc_html($sub_title); ?>
										</div>
										<?php endif; ?>
										<?php if ($desc) : ?>
										<div class="desc body-4 font-normal text-Primary-4">
											<?php echo wp_kses_post($desc); ?>
										</div>
										<?php endif; ?>
									</div>
								</div>
							</div>
							<?php if ($img_right) : ?>
							<div class="col-right">
								<div class="img">
									<a class="img-ratio" href="#">
										<img class="lozad" data-src="<?php echo esc_url($img_right); ?>" alt="">
									</a>
								</div>
							</div>
							<?php endif; ?>
						</div>
					</div>
				</div>
				<?php endforeach; ?>
			</div>
		</div>
		<div class="arrow-button flex items-center gap-5">
			<div class="btn btn-sw-1 btn-prev style-blue"><img class="img-svg" src="<?php echo esc_url(get_template_directory_uri() . '/img/arrow-left.svg'); ?>" alt=""></div>
			<div class="btn btn-sw-1 btn-next style-blue"><img class="img-svg" src="<?php echo esc_url(get_template_directory_uri() . '/img/arrow-right.svg'); ?>" alt=""></div>
		</div>
	</div>
</section>
