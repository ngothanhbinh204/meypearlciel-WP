<?php
/**
 * Home Section 3 — Tổng quan phân khu
 * ACF layout: overview (index 1) — title, image (background), stats repeater
 * stats sub-fields: value (short label/number), label (content text), icon (img src)
 */

$cc_sections = get_query_var('cc_sections', []);
$data        = $cc_sections['overview'][1] ?? null;
$title       = $data['title'] ?? '';
$bg_image    = $data['image']['url'] ?? '';
$stats       = $data['stats'] ?? [];
$bg_style    = $bg_image ? ' style="background-image: url(' . esc_url($bg_image) . ')"' : '';
?>
<section class="home-3 relative overflow-hidden section-py"<?php echo $bg_style; ?>>
	<div class="vector">
		<img class="img-svg" src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-home3-embed.svg'); ?>" alt="">
	</div>
	<div class="container-fluid">
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
						<div class="format-content body-3 font-normal text-Primary-4">
							<?php if (!empty($stat['value']) && !empty($stat['label'])) : ?>
							<p><strong><?php echo esc_html($stat['value']); ?></strong>: <?php echo esc_html($stat['label']); ?></p>
							<?php elseif (!empty($stat['label'])) : ?>
							<p><?php echo esc_html($stat['label']); ?></p>
							<?php elseif (!empty($stat['value'])) : ?>
							<p><?php echo esc_html($stat['value']); ?></p>
							<?php endif; ?>
						</div>
					</div>
				</div>
				<?php endforeach; ?>
			</div>
			<?php endif; ?>
		</div>
	</div>
</section>
