<?php
/**
 * Home Section 10 — Liên hệ / CTA
 * ACF layout: cta (index 0)
 * Fields: title, subtitle, background_image, phone, logo_section,
 *         contact_form (CF7 ID), popup_image_left, logo_popup, popup_contact_form (CF7 ID)
 *
 * Popup: #intro-popup — Fancybox registration form modal
 */

$cc_sections       = get_query_var('cc_sections', []);
$data              = $cc_sections['cta'][0] ?? null;
$title             = $data['title'] ?? '';
$subtitle          = $data['subtitle'] ?? '';
$phone             = $data['phone'] ?? '';
$bg_image          = $data['background_image'] ?? null;
$bg_url            = is_array($bg_image) ? ($bg_image['url'] ?? '') : $bg_image;
$bg_style          = $bg_url ? ' style="background-image: url(' . esc_url($bg_url) . ')"' : '';
$cf7_form_id       = (int) ($data['contact_form'] ?? 0);
$logo_section      = $data['logo_section'] ?? '';
$img_left_popup    = $data['popup_image_left'] ?? '';
$logo_popup        = $data['logo_popup'] ?? '';
$cf7_popup_form_id = (int) ($data['popup_contact_form'] ?? 0);

?>
<section id="home-10" class="home-10 relative overflow-hidden section-py"
	setBackground="<?php echo esc_url($bg_url); ?>">
	<div class="container-fluid">
		<div class="wrapper-main grid lg:grid-cols-[calc(840/1600*100%)_1fr] grid-cols-1 gap-base">
			<!-- Left: project title + developer logo -->
			<div class="col-left xl:rem:pl-[180px]">
				<?php if ($title) : ?>
				<h2 class="title heading-2 font-bold text-Primary-3 font-fontHeading uppercase mb-5"
					data-aos="fade-right" data-aos-delay="200" data-aos-duration="1000">
					<?php echo wp_kses_post($title); ?>
				</h2>
				<?php endif; ?>
				<div class="logo rem:max-w-[324px]" data-aos="fade-right" data-aos-delay="400" data-aos-duration="1000">
					<a class="img-ratio ratio:pt-[80_324]" href="#">
						<img class="lozad" data-src="<?php echo esc_url($logo_section); ?>" alt="">
					</a>
				</div>
			</div>
			<!-- Right: registration form -->
			<div class="col-right">
				<?php if ($subtitle) : ?>
				<h2 class="title text-center text-Primary-3 heading-1 font-fontHeading mb-6" data-aos="fade-up"
					data-aos-delay="200" data-aos-duration="1000">
					<?php echo esc_html($subtitle); ?>
				</h2>
				<?php endif; ?>
				<div class="my-8">
					<?php if ($cf7_form_id) : ?>
					<?php echo do_shortcode('[contact-form-7 id="' . esc_attr($cf7_form_id) . '"]'); ?>
					<?php endif; ?>
				</div>
				<?php if ($phone) : ?>
				<div class="hotline text-center text-Secondary-1 body-4">
					Hotline: <a href="tel:<?php echo esc_attr(preg_replace('/\D/', '', $phone)); ?>"
						class="font-bold"><?php echo esc_html($phone); ?></a>
				</div>
				<?php endif; ?>
			</div>
		</div>
	</div>
</section>

<!-- Intro registration popup -->
<div id="intro-popup" style="display: none;" data-fancybox-modal>
	<div class="wrapper-main grid md:grid-cols-2 grid-cols-1">
		<div class="col-left">
			<div class="img">
				<a class="img-ratio ratio:pt-[696_600]" href="#">
					<?php if ($img_left_popup) : ?>
					<img class="lozad" data-src="<?php echo esc_url($img_left_popup); ?>" alt="">
					<?php endif; ?>
				</a>
			</div>
		</div>
		<div class="col-right flex flex-col justify-center xl:p-10 p-6">
			<?php if ($logo_popup) : ?>
			<div class="logo rem:max-w-[248px] w-full mx-auto xl:mb-15 mb-3">
				<a class="img-ratio ratio:pt-[80_248]" href="#">
					<img class="lozad" data-src="<?php echo esc_url($logo_popup); ?>" alt="">
				</a>
			</div>
			<?php endif; ?>
			<div class="title heading-4 font-bold font-fontHeading text-Primary-1 mb-5 text-center">
				Liên hệ nhận thông tin tư vấn dự án
			</div>
			<?php if ($cf7_popup_form_id) : ?>
			<?php echo do_shortcode('[contact-form-7 id="' . esc_attr($cf7_popup_form_id) . '"]'); ?>
			<?php endif; ?>
		</div>
	</div>
</div>