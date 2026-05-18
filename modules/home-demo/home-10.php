<?php
/**
 * Home Section 10 — Liên hệ / CTA
 * ACF layout: cta (index 0)
 * Fields: title (left heading), subtitle (form heading), background_image (section bg), phone, button_text
 *
 * Popup: #intro-popup — Fancybox registration form modal
 */

$cc_sections  = get_query_var('cc_sections', []);
$data         = $cc_sections['cta'][0] ?? null;
$title        = $data['title'] ?? '';
$subtitle     = $data['subtitle'] ?? '';
$phone        = $data['phone'] ?? '';
$button_text  = $data['button_text'] ?? 'ĐĂNG KÝ';
$bg_image     = $data['background_image'] ?? null;
$bg_url       = is_array($bg_image) ? ($bg_image['url'] ?? '') : $bg_image;
$bg_style     = $bg_url ? ' style="background-image: url(' . esc_url($bg_url) . ')"' : '';

// Developer logo — from options or static fallback
$dev_logo_url = get_template_directory_uri() . '/img/logo-MeyGroup.png';
$options_logo = get_field('footer_logo', 'options');
if (is_array($options_logo) && !empty($options_logo['url'])) {
	$dev_logo_url = $options_logo['url'];
}
?>
<section class="home-10 relative overflow-hidden section-py" <?php echo $bg_style; ?>>
	<div class="container-fluid">
		<div class="wrapper-main grid lg:grid-cols-[calc(840/1600*100%)_1fr] grid-cols-1 gap-base">
			<!-- Left: project title + developer logo -->
			<div class="col-left xl:rem:pl-[180px]">
				<?php if ($title) : ?>
				<h2 class="title heading-2 font-bold font-fontHeading uppercase text-Secondary-1 mb-base"
					data-aos="fade-right" data-aos-delay="200" data-aos-duration="1000">
					<?php echo wp_kses_post($title); ?>
				</h2>
				<?php endif; ?>
				<div class="logo rem:max-w-[324px]" data-aos="fade-right" data-aos-delay="400" data-aos-duration="1000">
					<a class="img-ratio ratio:pt-[124_324]" href="#">
						<img class="lozad" data-src="<?php echo esc_url($dev_logo_url); ?>" alt="">
					</a>
				</div>
			</div>
			<!-- Right: registration form -->
			<div class="col-right">
				<?php if ($subtitle) : ?>
				<h2 class="title heading-2 font-bold font-fontHeading uppercase text-Secondary-1 mb-5"
					data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000">
					<?php echo esc_html($subtitle); ?>
				</h2>
				<?php endif; ?>
				<form class="my-8 contact-form" method="post" action="#" novalidate>
					<?php wp_nonce_field('home_contact_form', 'home_contact_nonce'); ?>
					<div class="wrap-form grid xl:grid-cols-2 grid-cols-1 gap-4">
						<div class="form-left flex flex-col gap-4">
							<div class="form-group">
								<input class="input" type="text" name="contact_name" placeholder="Họ và tên *" required>
							</div>
							<div class="form-group">
								<input class="input" type="tel" name="contact_phone" placeholder="Số điện thoại *"
									required>
							</div>
							<div class="form-group">
								<input class="input" type="email" name="contact_email" placeholder="Email">
							</div>
							<div class="form-group">
								<input class="input" type="text" name="contact_subject" placeholder="Chủ đề quan tâm">
							</div>
						</div>
						<div class="form-right">
							<div class="form-group h-full">
								<textarea class="textarea h-full rem:min-h-[180px]" name="contact_message"
									placeholder="Nội dung tư vấn"></textarea>
							</div>
						</div>
					</div>
					<div class="form-submit mt-5 flex-center">
						<button type="submit" class="button-submit pulse">
							<?php echo esc_html($button_text); ?>
						</button>
					</div>
				</form>
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
					<img class="lozad" data-src="<?php echo esc_url($dev_logo_url); ?>" alt="">
				</a>
			</div>
		</div>
		<div class="col-right flex flex-col justify-center xl:p-10 p-6">
			<div class="logo rem:max-w-[248px] mb-5">
				<a class="img-ratio ratio:pt-[60_248]" href="#">
					<img class="lozad" data-src="<?php echo esc_url($dev_logo_url); ?>" alt="">
				</a>
			</div>
			<div class="title heading-4 font-bold font-fontHeading text-Primary-1 mb-5">
				Liên hệ nhận thông tin tư vấn dự án
			</div>
			<form class="popup-form" method="post" action="#" novalidate>
				<?php wp_nonce_field('intro_popup_form', 'intro_popup_nonce'); ?>
				<div class="flex flex-col gap-3">
					<input class="input" type="text" name="popup_name" placeholder="Họ và tên *" required>
					<input class="input" type="tel" name="popup_phone" placeholder="Số điện thoại *" required>
					<input class="input" type="email" name="popup_email" placeholder="Email">
				</div>
				<div class="form-submit mt-5">
					<button type="submit" class="button-submit pulse w-full">ĐĂNG KÝ</button>
				</div>
			</form>
		</div>
	</div>
</div>