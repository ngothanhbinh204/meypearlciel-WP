<?php get_header(); ?>

<section class="search-page home-9 relative overflow-hidden bg-Primary-2">
	<div class="vector">
		<img class="img-svg" src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-home9-embed.svg'); ?>" alt="">
	</div>
	<div class="container">
		<div class="wrapper-main xl:py-25 py-10">
			<h2 class="heading-2 font-bold font-fontHeading text-Primary-3 text-center mb-base"
				data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000">
				Kết quả tìm kiếm: "<?php echo esc_html(get_search_query()); ?>"
			</h2>

			<?php if (have_posts()) : ?>
			<div class="wrapper-list grid grid-cols-1 gap-base">
				<?php $i = 0; while (have_posts()) : the_post();
					if (get_post_type() !== 'post') { continue; }
					$thumbnail_url = get_the_post_thumbnail_url(get_the_ID(), 'large');
					$permalink     = get_permalink();
					$date          = get_the_date('d.m.Y');
					$categories    = get_the_category();
					$cat_name      = !empty($categories) ? $categories[0]->name : '';
					$excerpt       = wp_trim_words(get_the_excerpt() ?: get_the_content(), 25, '...');
				?>
				<div class="news-item" data-aos="fade-up" data-aos-delay="<?php echo ($i * 200 + 200); ?>"
					data-aos-duration="1000">
					<div class="wrap-inner">
						<div class="img">
							<a class="img-ratio ratio:pt-[560_430]" href="#popup-news-<?php echo esc_attr(get_the_ID()); ?>"
								data-fancybox="news-<?php echo esc_attr(get_the_ID()); ?>">
								<?php if ($thumbnail_url) : ?>
								<img class="lozad" data-src="<?php echo esc_url($thumbnail_url); ?>"
									alt="<?php echo esc_attr(get_the_title()); ?>">
								<?php endif; ?>
							</a>
						</div>
						<?php if ($cat_name) : ?>
						<div class="category inline-flex items-center text-Primary-3 bg-Primary-1">
							<span><?php echo esc_html($cat_name); ?></span>
						</div>
						<?php endif; ?>
					</div>
					<div class="content text-white mt-3">
						<a class="stretched-link" href="#popup-news-<?php echo esc_attr(get_the_ID()); ?>"
							data-fancybox="news-<?php echo esc_attr(get_the_ID()); ?>"></a>
						<h3 class="xl:rem:text-[30px] rem:text-[24px] font-bold font-fontHeading text-Primary-3 uppercase title">
							<a href="<?php echo esc_url($permalink); ?>"><?php echo esc_html(get_the_title()); ?></a>
						</h3>
						<div class="date my-3 body-14 font-normal"><?php echo esc_html($date); ?></div>
						<div class="format-content font-normal">
							<p><?php echo esc_html($excerpt); ?></p>
						</div>
					</div>
				</div>
				<?php $i++; endwhile; ?>
			</div>
			<?php else : ?>
			<p class="text-white text-center body-16">Không tìm thấy kết quả nào.</p>
			<?php endif; ?>
		</div>
	</div>
</section>

<?php
rewind_posts();
if (have_posts()) :
	while (have_posts()) : the_post();
		if (get_post_type() !== 'post') { continue; }
		$popup_title   = get_the_title();
		$popup_date    = get_the_date('d / m / Y');
		$popup_content = apply_filters('the_content', get_the_content());
?>
<div id="popup-news-<?php echo esc_attr(get_the_ID()); ?>" style="display:none;" data-fancybox-modal>
	<div class="popup-content rem:max-w-[1200px] w-full mx-auto">
		<div class="wrap-heading mb-5 pb-5 border-b border-b-Primary-1/20">
			<div class="title heading-3 font-bold font-fontHeading text-Primary-1">
				<?php echo esc_html($popup_title); ?>
			</div>
			<div class="wrap-date flex items-center gap-3 mt-2 font-normal text-Primary-4">
				<div class="icon body-2 text-Primary-2">
					<i class="fa-light fa-calendar"></i>
				</div>
				<div class="date">
					<?php echo esc_html($popup_date); ?>
				</div>
			</div>
		</div>
		<div class="format-content font-normal text-Primary-4">
			<?php echo wp_kses_post($popup_content); ?>
		</div>
	</div>
</div>
<?php
	endwhile;
endif;
?>

<?php get_footer(); ?>