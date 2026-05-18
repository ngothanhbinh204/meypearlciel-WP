<?php
/**
 * Template Name: Home Demo
 *
 * @package Canhcam
 */

get_header();

// Build sections index from flexible content (layout_name => [row0, row1, ...])
$cc_sections   = [];
$page_sections = get_field('page_sections') ?: [];
foreach ($page_sections as $section) {
	$cc_sections[$section['acf_fc_layout']][] = $section;
}
set_query_var('cc_sections', $cc_sections);

get_template_part('modules/home-demo/home-1');
get_template_part('modules/home-demo/home-2');
get_template_part('modules/home-demo/home-3');
get_template_part('modules/home-demo/home-4');
get_template_part('modules/home-demo/home-5');
get_template_part('modules/home-demo/home-6');
get_template_part('modules/home-demo/home-7');
get_template_part('modules/home-demo/home-8');
get_template_part('modules/home-demo/home-9');
get_template_part('modules/home-demo/home-10');

get_footer();

