<?php
/**
 * Home Section 5 — Hệ tiện ích ALL IN ONE
 * ACF layout: utilities_all_in_one trong page_sections
 */

if (!function_exists('cc_home5_amenity_name')) {
	function cc_home5_amenity_name(array $amenity) {
		return trim((string) ($amenity['amenity_name'] ?? $amenity['name'] ?? ''));
	}
}
if(!function_exists('cc_home5_amenity_number')) {
	function cc_home5_amenity_number(array $amenity) {
		foreach (array('number', 'amenity_number', 'data_number') as $key) {
			$val = trim((string) ($amenity[$key] ?? ''));
			if ($val !== '') {
				return $val;
			}
		}
		return '#000000';
	}
}
if(!function_exists('cc_home5_amenity_color')) {
	function cc_home5_amenity_color(array $amenity) {
		foreach (array('color', 'amenity_color', 'color_code') as $key) {
			$val = trim((string) ($amenity[$key] ?? ''));
			if ($val !== '') {
				return $val;
			}
		}
		return '#000000';
	}
}

if (!function_exists('cc_home5_floor_name')) {
	function cc_home5_floor_name(array $group) {
		return trim((string) ($group['floor_name'] ?? $group['name'] ?? ''));
	}
}

if (!function_exists('cc_home5_floor_code')) {
	function cc_home5_floor_code(array $group) {
		foreach (array('floor_number', 'floor_code', 'code') as $key) {
			$val = trim((string) ($group[$key] ?? ''));
			if ($val !== '') {
				return $val;
			}
		}
		$name = cc_home5_floor_name($group);
		return $name !== '' ? sanitize_title($name) : '';
	}
}

if (!function_exists('cc_home5_group_amenities')) {
	function cc_home5_group_amenities(array $group) {
		foreach (array('amenities', 'amenity_list', 'floor_amenities') as $key) {
			if (!empty($group[$key]) && is_array($group[$key])) {
				return $group[$key];
			}
		}
		return array();
	}
}

if (!function_exists('cc_home5_amenity_map_id')) {
	function cc_home5_amenity_map_id(array $amenity, $floor_code = '') {
		foreach (array('mapping_id', 'amenity_map_id', 'map_id', 'data_title', 'data_title_imp') as $key) {
			if (!empty($amenity[$key])) {
				return trim((string) $amenity[$key]);
			}
		}

		$floor_code = trim((string) $floor_code);
		$name       = cc_home5_amenity_name($amenity);

		if ($floor_code !== '' && $name !== '') {
			$slug = sanitize_title($name);
			if ($slug !== '') {
				return sanitize_title($floor_code) . '-' . $slug;
			}
		}

		if ($name !== '') {
			return sanitize_title($name);
		}

		return '';
	}
}

if (!function_exists('cc_home5_amenity_description')) {
	function cc_home5_amenity_description(array $amenity) {
		foreach (array('amenity_description', 'description', 'amenity_tooltip', 'tooltip') as $key) {
			if (!empty($amenity[$key])) {
				return $amenity[$key];
			}
		}
		return '';
	}
}

$cc_sections   = get_query_var('cc_sections', array());
$data          = $cc_sections['utilities_all_in_one'][0] ?? null;

if (!$data && !empty($GLOBALS['RE_UTILITIES']) && is_array($GLOBALS['RE_UTILITIES'])) {
	$data = $GLOBALS['RE_UTILITIES'];
}

$section_title = $data['section_title'] ?? '';
$description   = $data['section_description'] ?? '';
$masterplan    = $data['masterplan_image'] ?? '';
$floor_groups  = is_array($data['floor_groups'] ?? null) ? $data['floor_groups'] : array();
?>
<section id="home-5" class="home-5 section-amenity section-swiper relative overflow-hidden"
	data-image-map-name="Tiện Ích">
	<div class="vector-1"><img src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-h-5-1.svg'); ?>"
			alt=""></div>
	<div class="vector-2"><img src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-h-5-2.svg'); ?>"
			alt=""></div>
	<div class="image-map-wrapper">
		<?php echo do_shortcode('[tienich]'); ?>
		<div class="bg-overlay"></div>
	</div>
	<div class="section-amenity-wrapper">
		<div class="wrap-inner xl:mb-16 mb-base text-white">
			<div class="sub heading-4 font-fontHeading font-bold text-Primary-3" data-aos="fade-up" data-aos-delay="200"
				data-aos-duration="1000">Hệ tiện ích</div>
			<?php if ($section_title) : ?>
			<div class="title heading-2 font-fontHeading font-bold uppercase mb-1" data-aos="fade-up"
				data-aos-delay="400" data-aos-duration="1000">
				<?php echo esc_html($section_title); ?>
			</div>
			<?php endif; ?>
			<?php if ($description) : ?>
			<div class="ctn body-3 font-normal" data-aos="fade-up" data-aos-delay="600" data-aos-duration="1000">
				<?php echo wp_kses_post($description); ?>
			</div>
			<?php endif; ?>
		</div>
		<?php if ($floor_groups) : ?>
		<div class="amenity-legend-wrap mt-7" data-aos="fade-right" data-aos-delay="800" data-aos-duration="700">
			<div class="wrap-item-toggle flex flex-col gap-3">
				<?php foreach ($floor_groups as $group) :
					$floor_code = cc_home5_floor_code($group);
					$amenities  = cc_home5_group_amenities($group);
					?>
				<div class="item-toggle group transition-300" <?php
					echo $floor_code ? ' data-floor-code="' . esc_attr($floor_code) . '"' : '';
					echo $floor_code ? ' data-floor-focus="' . esc_attr($floor_code . '-zoom') . '"' : '';
					?>>
					<div class="title flex items-center justify-between cursor-pointer transition-300">
						<div class="toggle-wrapper flex items-center gap-5">
							<div class="floor body-3 font-semibold text-Primary-3 font-fontHeading">
								<?php echo esc_html(cc_home5_floor_name($group)); ?>
							</div>
						</div>
						<i class="fa-light fa-plus text-xl ml-auto transition-300 text-white"></i>
					</div>
					<?php if ($amenities) : ?>
					<div class="content" style="display: none;">
						<div class="amenity-legend-list">
							<?php foreach ($amenities as $i => $amenity) :
								$map_id = cc_home5_amenity_map_id($amenity, $floor_code);
								$amenity_color = cc_home5_amenity_color($amenity);
								?>
							<a class="amenity-legend-item" data-imp-trigger-object-on-click="floor-1-zoom"
								data-imp-trigger-object-on-mouseover="<?php echo esc_attr($map_id); ?>"
								href="javascript:void(0)"
								<?php echo $map_id ? ' data-map-id="' . esc_attr($map_id) . '"' : ''; ?>
								data-amenity-color="<?php echo esc_attr($amenity_color); ?>">
								<div style="background-color: <?php echo esc_attr($amenity_color); ?>;"
									class="amenity-legend-item-number">
									<span>
										<?php echo esc_html(cc_home5_amenity_number($amenity)); ?>
									</span>
								</div>
								<div class="amenity-legend-item-text">
									<?php echo esc_html(cc_home5_amenity_name($amenity)); ?>
								</div>
							</a>
							<?php endforeach; ?>
						</div>
					</div>
					<?php endif; ?>
				</div>
				<?php endforeach; ?>
			</div>
		</div>
		<?php endif; ?>
	</div>

	<div class="wrap-amenity-tooltip hidden">
		<?php
		if (!$data) {
			echo '<!-- home-5 tooltip: $data null — thiếu utilities_all_in_one hoặc RE_UTILITIES -->';
		} elseif (!$floor_groups) {
			echo '<!-- home-5 tooltip: floor_groups rỗng -->';
		}

		foreach ($floor_groups as $group) {
			$floor_code = cc_home5_floor_code($group);
			$floor_name = cc_home5_floor_name($group);
			$amenities  = cc_home5_group_amenities($group);

			foreach ($amenities as $amenity) {
				$name = cc_home5_amenity_name($amenity);
				$desc = cc_home5_amenity_description($amenity);
				$map_id = cc_home5_amenity_map_id($amenity, $floor_code);

				if ($map_id === '' && $name === '' && $desc === '') {
					continue;
				}
				if ($map_id === '' && $name !== '') {
					$map_id = sanitize_title($name);
				}
				?>
		<div class="amenity-tooltip-wrapper" data-index="<?php echo esc_attr($map_id); ?>"
			data-title="<?php echo esc_attr($map_id); ?>" data-map-id="<?php echo esc_attr($map_id); ?>"
			<?php echo $floor_code ? ' data-floor-code="' . esc_attr($floor_code) . '"' : ''; ?>>
			<div class="amenity-tooltip-item">
				<!-- <div class="plan-tooltip-icon">
					<i class="fa-regular fa-plus"></i>
				</div> -->
				<?php if ($name !== '') : ?>
				<div class="amenity-tooltip-item-title">
					<h3><?php echo esc_html($name); ?></h3>
				</div>
				<?php endif; ?>
				<!-- <?php if ($desc !== '') : ?>
				<div class="amenity-tooltip-item-content">
					<?php echo wp_kses_post($desc); ?>
				</div>
				<?php endif; ?> -->
			</div>
		</div>
		<?php
			}
		}
		?>
	</div>
</section>