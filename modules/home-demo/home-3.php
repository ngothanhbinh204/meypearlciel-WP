<?php
/**
 * Home Section 3 — Tổng quan phân khu
 * ACF layout: overview — title, background_image, stats repeater
 * stats sub-fields: icon (text), label (text), description (wysiwyg)
 */

$cc_sections = get_query_var('cc_sections', []);
$data        = $cc_sections['overview'][0] ?? null;
$title       = $data['title'] ?? '';
$bg_image    = $data['background_image']['url'] ?? '';
$stats       = $data['stats'] ?? [];
$bg_style    = $bg_image ? ' style="background-image: url(' . esc_url($bg_image) . ')"' : '';
?>
<section id="home-3" class="home-3 relative overflow-hidden" >
	<div class="vector">
		<img class="img-svg" src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-home3-embed.svg'); ?>"
			alt="">
	</div>
	<div class="vector-mobile mobile-show" aria-hidden="true"><img class="img-svg"
			src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-home3-embed-mobile.svg'); ?>" alt="">
	</div>
	<div class="bg-overview">
		<a href="#" class="img-ratio ratio:pt-[960_1920]">
			<img src="<?php echo esc_url($bg_image); ?>" alt="">
		</a>
		<div class="wrap-content home-item-animation rem:max-w-[540px] w-full ml-auto bg-Secondary-1 xl:p-8 p-4">
			<?php if ($title) : ?>
			<h2 class="title-box heading-2 uppercase font-fontHeading text-Primary-2 font-bold mb-8 block-title">
				<?php echo esc_html($title); ?>
			</h2>
			<?php endif; ?>
			<?php if ($stats) : ?>
			<div class="infos flex flex-col gap-3">
				<?php foreach ($stats as $stat) : ?>
				<div class="item flex gap-2 pb-3 border-b border-b-Primary-2/20">
					<?php if (!empty($stat['icon'])) : ?>
					<div class="icon">
						<img class="img-svg" src="<?php echo esc_url($stat['icon']); ?>" alt="">

					</div>
					<?php endif; ?>
					<div class="content">
						<?php if (!empty($stat['label'])) : ?>
						<div class="label body-3 font-semibold text-Primary-2 mb-1">
							<?php echo esc_html($stat['label']); ?></div>
						<?php endif; ?>
						<?php if (!empty($stat['description'])) : ?>
						<div class="format-content body-3 font-normal text-Primary-4">
							<?php echo wp_kses_post($stat['description']); ?>
						</div>
						<?php endif; ?>
					</div>
				</div>
				<?php endforeach; ?>
			</div>
			<?php endif; ?>
		</div>
	</div>
</section>