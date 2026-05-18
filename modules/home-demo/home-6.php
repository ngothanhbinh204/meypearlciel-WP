<?php
/**
 * Home Section 6 — Lifestyle Experience Swiper
 * ACF layout: lifestyle
 * Each utility_item = one slide: icon (image url) → left + right images, name → title, description → desc
 */

$cc_sections   = get_query_var('cc_sections', []);
$data          = $cc_sections['lifestyle'][0] ?? null;
$utility_items = $data['utility_items'] ?? [];
?>
<section class="home-6 relative overflow-hidden">
	<div class="swiper-column-auto relative" data-speed="700">
		<div class="swiper">
			<div class="swiper-wrapper">
				<?php if ($utility_items) : ?>
				<?php foreach ($utility_items as $item) : ?>
				<div class="swiper-slide bg-Secondary-1 pt-10 xl:pb-25 pb-10">
					<div class="vector">
						<img class="img-svg" src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-home6-embed.svg'); ?>" alt="">
					</div>
					<div class="wrap-container xl:rem:pl-[160px] xl:pr-20 px-4">
						<div class="wrapper-main grid lg:grid-cols-[calc(884/1680*100%)_1fr] grid-cols-1 gap-4 xl:rem:gap-[146px]">
							<div class="col-left">
								<div class="wrap-left grid lg:grid-cols-[calc(450/884*100%)_1fr] xl:rem:gap-[47px] xl:rem:mt-[200px] gap-5">
									<?php if (!empty($item['icon'])) : ?>
									<div class="img">
										<a class="img-ratio ratio:pt-[580_450]" href="#">
											<img class="lozad" data-src="<?php echo esc_url($item['icon']); ?>" alt="<?php echo esc_attr($item['name'] ?? ''); ?>">
										</a>
									</div>
									<?php endif; ?>
									<div class="content">
										<?php if (!empty($item['name'])) : ?>
										<div class="title heading-2 font-fontHeading font-bold uppercase mb-2 text-Primary-1">
											<?php echo esc_html($item['name']); ?>
										</div>
										<?php endif; ?>
										<?php if (!empty($item['description'])) : ?>
										<div class="desc body-4 font-normal text-Primary-4">
											<p><?php echo esc_html($item['description']); ?></p>
										</div>
										<?php endif; ?>
									</div>
								</div>
							</div>
							<?php if (!empty($item['icon'])) : ?>
							<div class="col-right">
								<div class="img">
									<a class="img-ratio" href="#">
										<img class="lozad" data-src="<?php echo esc_url($item['icon']); ?>" alt="">
									</a>
								</div>
							</div>
							<?php endif; ?>
						</div>
					</div>
				</div>
				<?php endforeach; ?>
				<?php endif; ?>
			</div>
		</div>
		<div class="arrow-button flex items-center gap-5">
			<div class="btn btn-sw-1 btn-prev style-blue"><img class="img-svg" src="<?php echo esc_url(get_template_directory_uri() . '/img/arrow-left.svg'); ?>" alt=""></div>
			<div class="btn btn-sw-1 btn-next style-blue"><img class="img-svg" src="<?php echo esc_url(get_template_directory_uri() . '/img/arrow-right.svg'); ?>" alt=""></div>
		</div>
	</div>
</section>
