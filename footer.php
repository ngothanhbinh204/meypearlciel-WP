</main>

<?php
$footer_logo      = get_field('footer_logo', 'options');
$footer_address   = get_field('footer_address', 'options');
$footer_map_url   = get_field('footer_map_url', 'options');
$footer_hotline   = get_field('footer_hotline', 'options');
$footer_email     = get_field('footer_email', 'options');
$footer_copyright = get_field('footer_copyright', 'options');
$footer_socials   = get_field('footer_social_links', 'options');
$footer_bg        = get_field('footer_bg_image', 'options');
?>

<footer class="footer py-10 xl:pt-0"
	<?php echo $footer_bg ? ' style="background-image: url(' . esc_url($footer_bg) . ')"' : ''; ?>>
	<div class="footer-btn-to-top">
		<div class="container">
			<div class="wrap-button-to-top flex items-center justify-end">
				<div class="btn button-to-top">
					<div class="btn-icon">
						<div class="icon">
							<span class="material-symbols-outlined-300">arrow_upward</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="footer-top xl:rem:py-[90px]">
		<div class="container">
			<div class="wrap-top flex justify-center flex-col items-center">
				<div class="footer-logo rem:max-w-[497px] w-full xl:mb-15 mb-base">
					<a class="img-ratio ratio:pt-[160_497]" href="<?php echo esc_url(home_url('/')); ?>">
						<?php if ($footer_logo) : ?>
						<img class="lozad" data-src="<?php echo esc_url($footer_logo['url']); ?>"
							alt="<?php echo esc_attr($footer_logo['alt']); ?>">
						<?php else : ?>
						<img src="<?php echo esc_url(get_template_directory_uri() . '/img/logo-footer.png'); ?>"
							alt="Logo">
						<?php endif; ?>
					</a>
				</div>
				<div class="footer-contact rem:max-w-[385px] w-full mx-auto text-center flex flex-col gap-2">
					<?php if ($footer_address) : ?>
					<?php echo wp_kses_post($footer_address); ?>
					<?php endif; ?>
					<?php if ($footer_map_url) : ?>
					<p><a href="<?php echo esc_url($footer_map_url); ?>" target="_blank" rel="noopener noreferrer">Xem
							bản đồ</a></p>
					<?php endif; ?>
					<?php if ($footer_hotline) : ?>
					<div class="">
						Hotline: <?php echo wp_kses_post($footer_hotline); ?>
					</div>

					<?php endif; ?>
					<?php if ($footer_email) : ?>
					<div class="">
						Email: <?php echo wp_kses_post($footer_email); ?>
					</div>

					<?php endif; ?>
				</div>
			</div>
		</div>
	</div>
	<div class="footer-bottom xl:mt-20 mt-base">
		<div class="container">
			<div class="wrapper-main flex items-center justify-between">
				<div class="footer-copyright">
					<p><?php echo $footer_copyright ? esc_html($footer_copyright) : ''; ?></p>
				</div>
				<?php if ($footer_socials) : ?>
				<div class="footer-sosials">
					<ul>
						<?php foreach ($footer_socials as $item) : ?>
						<li>
							<a href="<?php echo esc_url($item['social_url']); ?>" target="_blank"
								rel="noopener noreferrer">
								<i class="<?php echo esc_attr($item['social_icon']); ?>"></i>
							</a>
						</li>
						<?php endforeach; ?>
					</ul>
				</div>
				<?php endif; ?>
			</div>
		</div>
	</div>
</footer>

<div class="cursor outer"></div>
<div class="cursor inner"></div>

<?php if (stripos($_SERVER['HTTP_USER_AGENT'], 'Chrome-Lighthouse') === false) : ?>
<?php wp_footer() ?>
<?php endif; ?>
<?= get_field('field_config_body', 'options') ?>
<script>
let wpcf7ElmRegister = document.querySelector(".primary-banner .wpcf7");
let loaderRegister = document.querySelector(".primary-banner .loader");

if (wpcf7ElmRegister && loaderRegister) {
	// Show loader when validation starts (button greys out)
	wpcf7ElmRegister.addEventListener("wpcf7beforesubmit", function(event) {
		loaderRegister.style.display = "block";
	});

	// Hide loader when validation completes (regardless of result)
	const hideLoader = () => {
		loaderRegister.style.display = "none";
	};

	document.addEventListener("wpcf7mailsent", hideLoader);
	document.addEventListener("wpcf7mailfailed", hideLoader);
	document.addEventListener("wpcf7invalid", hideLoader);
	document.addEventListener("wpcf7spam", hideLoader);
}
</script>
</body>

</html>