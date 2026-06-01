<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Big+Shoulders:opsz,wght@10..72,100..900&display=swap"
		rel="stylesheet">
	<?php wp_head(); ?>
	<?= get_field('field_config_head', 'options') ?>
</head>

<body <?php body_class(get_field('add_class_body', get_the_ID())) ?>>

	<?php
$searchUrl = home_url() . "/?s=";
$header_logo    = get_field('header_logo', 'options');
$header_socials = get_field('header_social_links', 'options');
$wpml_languages = apply_filters('wpml_active_languages', null, 'skip_missing=0');
?>

	<header class="header">
		<div class="header-container xl:px-25 px-4">
			<div class="header-wrapper">
				<div class="header-logo">
					<a href="<?php echo esc_url(home_url('/')); ?>" alt="logo">
						<?php if ($header_logo) : ?>
						<img class="lozad" data-src="<?php echo esc_url($header_logo['url']); ?>"
							alt="<?php echo esc_attr($header_logo['alt']); ?>">
						<?php else : ?>
						<img src="<?php echo esc_url(get_template_directory_uri() . '/img/logo.png'); ?>" alt="Logo">
						<?php endif; ?>
					</a>
				</div>
				<div class="header-right">
					<div class="header-right-inner">
						<?php if (!empty($wpml_languages)) : 
    // Mảng map mã ngôn ngữ => hiển thị
    $language_code_map = array(
        'vi' => 'VN',  // Chuyển vi -> VN
        'en' => 'EN',  // en -> EN
        // Thêm các map khác nếu cần
    );
?>
						<div class="header-language">
							<div class="header-language-active">
								<ul>
									<?php foreach ($wpml_languages as $lang) : if ($lang['active']) : 
                $display_code = isset($language_code_map[$lang['language_code']]) 
                    ? $language_code_map[$lang['language_code']] 
                    : strtoupper($lang['language_code']);
            ?>
									<li class="wpml-ls-current-language">
										<a href="<?php echo esc_url($lang['url']); ?>">
											<span class="wpml-ls-native"><?php echo esc_html($display_code); ?></span>
										</a>
									</li>
									<?php endif; endforeach; ?>
								</ul>
							</div>
							<div class="header-language-list">
								<ul>
									<?php foreach ($wpml_languages as $lang) : if (!$lang['active']) : 
                $display_code = isset($language_code_map[$lang['language_code']]) 
                    ? $language_code_map[$lang['language_code']] 
                    : strtoupper($lang['language_code']);
            ?>
									<li>
										<a href="<?php echo esc_url($lang['url']); ?>">
											<span><?php echo esc_html($display_code); ?></span>
										</a>
									</li>
									<?php endif; endforeach; ?>
								</ul>
							</div>
						</div>
						<?php endif; ?>
						<div class="header-bar relative cursor-pointer" id="burger">
							<div class="burger-ratio img-ratio">
								<svg class="default-burger" xmlns="http://www.w3.org/2000/svg" width="53" height="16"
									viewBox="0 0 53 16" fill="none">
									<rect width="53" height="2" fill="white" />
									<rect y="14" width="53" height="2" fill="white" />
								</svg>
								<div class="burger-open absolute pointer-events-none opacity-0 invisible">
									<svg class="open-burger" width="53" height="16" viewBox="0 0 53 16" fill="none"
										xmlns="http://www.w3.org/2000/svg">
										<rect x="1" y="1" width="53" height="2" transform="rotate(14 1 1)"
											fill="white" />
										<rect x="1" y="14.0002" width="53" height="2" transform="rotate(-14 1 14.0002)"
											fill="white" />
									</svg>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</header>

	<div class="header-overlay"></div>

	<div class="nav-mobile fixed top-header right-0 w-full z-[200] flex flex-col">
		<div class="vector" aria-hidden="true">
			<img class="img-svg" src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-home-nav.svg'); ?>"
				alt="">
		</div>
		<div class="nav-wrapper h-full flex flex-col relative flex-1 overflow-hidden rem:pl-[48px] xl:rem:mt-[140px]">
			<div class="nav-wrapper-inner overflow-auto overflow-x-hidden flex flex-col justify-between">
				<div class="nav-menu">
					<nav>
						<?php wp_nav_menu([
						'theme_location' => 'header-menu',
						'container'      => false,
						'fallback_cb'    => false,
					]); ?>
					</nav>
					<div class="nav-search xl:mt-12 mt-6">
						<div class="wrap-form-search relative">
							<form class="header-search-box" action="<?= esc_url(home_url('/')) ?>" method="get">
								<input type="text" name="s"
									placeholder="<?php esc_attr_e('Tìm kiếm', 'canhcamtheme'); ?>"
									value="<?php echo esc_attr(get_search_query()); ?>">
								<button type="submit" aria-label="<?php esc_attr_e('Tìm kiếm', 'canhcamtheme'); ?>">
									<i class="fa-light fa-magnifying-glass"></i>
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
			<?php if ($header_socials) : ?>
			<div class="nav-socials">
				<ul>
					<?php foreach ($header_socials as $item) : ?>
					<li>
						<a href="<?php echo esc_url($item['social_url']); ?>" target="_blank" rel="noopener noreferrer">
							<i class="<?php echo esc_attr($item['social_icon']); ?>"></i>
						</a>
					</li>
					<?php endforeach; ?>
				</ul>
			</div>
			<?php endif; ?>
		</div>
	</div>

	<div class="header-search-form">
		<div
			class="close flex items-center justify-center absolute top-0 right-0 bg-white text-3xl cursor-pointer w-12.5 h-12.5">
			<i class="fa-light fa-xmark"></i>
		</div>
		<div class="container">
			<div class="wrap-form-search-product">
				<div class="productsearchbox">
					<input type="text" placeholder="<?php esc_attr_e('Tìm kiếm thông tin', 'canhcamtheme'); ?>">
					<button aria-label="<?php esc_attr_e('Tìm kiếm', 'canhcamtheme'); ?>"><i
							class="fa-light fa-magnifying-glass"></i></button>
				</div>
			</div>
		</div>
	</div>

	<main>