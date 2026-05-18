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
	<?php if (stripos($_SERVER['HTTP_USER_AGENT'], 'Chrome-Lighthouse') === false) : ?>
	<?php endif; ?>
	<?php wp_head(); ?>
	<?= get_field('field_config_head', 'options') ?>
</head>

<body <?php body_class(get_field('add_class_body', get_the_ID())) ?>>
	<header>
	</header>
	<main>