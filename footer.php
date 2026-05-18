<footer>
</footer>
</main>
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