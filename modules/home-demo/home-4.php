<?php
/**
 * Home Section 4 — Vị trí dự án
 * ACF layout: location (index 0)
 * Fields: title, description (wysiwyg), image (map photo), highlights repeater (icon=time/distance, label=place name)
 */

$cc_sections = get_query_var('cc_sections', []);
$data        = $cc_sections['location'][0] ?? null;
$title       = $data['title'] ?? '';
$subtitle	= $data['subtitle'] ?? '';
$description = $data['description'] ?? '';
$map_image   = $data['image'] ?? null;
$highlights  = $data['highlights'] ?? [];

function get_svg_with_class($attachment_id, $class = 'img-svg') {
    $path = get_attached_file($attachment_id);
    if (!file_exists($path)) {
        return '';
    }
    
    $svg_content = file_get_contents($path);
    if (!$svg_content) {
        return '';
    }
    
    // Dùng DOMDocument để thêm class an toàn
    $dom = new DOMDocument();
    $old_libxml_errors = libxml_use_internal_errors(true);
    $dom->loadXML($svg_content);
    libxml_use_internal_errors($old_libxml_errors);
    
    $svg = $dom->getElementsByTagName('svg')->item(0);
    if ($svg) {
        $old_class = $svg->getAttribute('class');
        $new_class = trim($old_class . ' ' . $class);
        $svg->setAttribute('class', $new_class);
    }
    
    return $dom->saveXML($svg);
}
?>
<section id="home-4" class="home-4 relative overflow-hidden bg-Secondary-1">
	<div class="container-fluid default-container-js flex flex-col">
		<div class="wrapper grid xl:grid-cols-[calc(486/1760*100%)_1fr] grid-cols-1 xl:gap-0 gap-base h-full">
			<div class="col-left xl:pt-20">
				<?php if ($title) : ?>
				<div class="title heading-2 font-bold text-Primary-1 font-fontHeading mb-5" data-aos="fade-up"
					data-aos-delay="200" data-aos-duration="1000">
					<?php echo esc_html($title); ?>
				</div>
				<?php endif; ?>
				<?php if ($subtitle) : ?>
				<div class="sub-title heading-hightlight font-normal font-secondary text-Primary-1 mb-5 leading-none"
					data-aos="fade-up" data-aos-delay="400" data-aos-duration="1000">
					<?php echo wp_kses_post($subtitle); ?>
				</div>
				<?php endif; ?>
				<?php if ($description) : ?>
				<div class="format-content space-y-5 font-normal text-Primary-4 xl:rem:pr-[98px]" data-aos="fade-up"
					data-aos-delay="600" data-aos-duration="1000">
					<?php echo wp_kses_post($description); ?>
				</div>
				<?php endif; ?>
			</div>
			<?php if ($map_image) : ?>
			<div class="col-right" stick-to-edge="right" unstick-min="1024">
				<div class="img">
					<a class="img-ratio ratio:pt-[60%]" href="javascript:void(0)">
						<?php echo get_svg_with_class($map_image['ID'], 'img-svg'); ?>
					</a>
				</div>
			</div>
			<?php endif; ?>
		</div>
	</div>
	<?php if ($highlights) : ?>
	<div
		class="location-wrapper xl:rem:mt-[88px] max-xl:overflow-x-auto max-xl:overflow-y-hidden max-xl:[-webkit-overflow-scrolling:touch] overflow-auto">
		<div class="location-track relative max-xl:w-max max-xl:min-w-full w-full">
			<div
				class="wrap-list flex max-xl:flex-nowrap xl:justify-between gap-5 relative xl:px-10 px-4 h-full xl:gap-0">
				<?php foreach ($highlights as $item) : ?>
				<div class="location-item flex gap-5">
					<div
						class="location-item-time heading-4 rem:w-[56px] flex-shrink-0 font-bold text-Primary-1 font-fontHeading">
						<?php echo esc_html($item['icon']); ?>
					</div>
					<div class="infos border-l-2 border-l-Primary-1 pl-3 text-Primary-4 font-normal flex-1 pb-10">
						<div class="title"><?php echo wp_kses_post($item['label']); ?></div>
					</div>
				</div>
				<?php endforeach; ?>
			</div>
			<div class="car xl:rem:w-[798px] max-w-full absolute bottom-0">
				<a class="img-ratio ratio:pt-[30_798]" href="javascript:void(0)">
					<img src="<?php echo esc_url(get_template_directory_uri() . '/img/car.png'); ?>" alt="">
				</a>
			</div>
		</div>
	</div>
	<?php endif; ?>
</section>