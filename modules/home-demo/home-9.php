<?php
/**
 * Home Section 9 — Tin tức mới nhất
 * Data source: WP_Query — 3 most recent posts (standard post type)
 *
 * Popup: #popup-news — renders the first post's full content as a Fancybox modal
 */

$news_query = new WP_Query([
	'post_type'      => 'post',
	'posts_per_page' => 3,
	'post_status'    => 'publish',
	'orderby'        => 'date',
	'order'          => 'DESC',
]);
$posts = $news_query->posts;
$popup_post = $posts[0] ?? null;
?>
<section class="home-9 relative overflow-hidden section-py bg-Primary-2">
	<div class="vector">
		<img class="img-svg" src="<?php echo esc_url(get_template_directory_uri() . '/img/vector-home9-embed.svg'); ?>" alt="">
	</div>
	<div class="container">
		<div class="wrapper-main xl:py-25 py-10">
			<h2 class="heading-2 font-bold font-fontHeading uppercase text-Secondary-1 text-center mb-base" data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000">
				Tin tức
			</h2>
			<?php if ($posts) : ?>
			<div class="wrapper-list grid md:grid-cols-3 grid-cols-1 gap-base">
				<?php foreach ($posts as $i => $post) :
					$thumbnail_url = get_the_post_thumbnail_url($post->ID, 'large');
					$permalink     = get_permalink($post->ID);
					$date          = get_the_date('d.m.Y', $post->ID);
					$categories    = get_the_category($post->ID);
					$cat_name      = !empty($categories) ? $categories[0]->name : '';
					$excerpt       = wp_trim_words($post->post_excerpt ?: $post->post_content, 25, '...');
				?>
				<div class="news-item" data-aos="fade-up" data-aos-delay="<?php echo ($i * 200 + 200); ?>" data-aos-duration="1000">
					<div class="wrap-inner">
						<div class="img">
							<a class="img-ratio ratio:pt-[560_430]" href="#popup-news" data-fancybox="news-<?php echo esc_attr($post->ID); ?>">
								<?php if ($thumbnail_url) : ?>
								<img class="lozad" data-src="<?php echo esc_url($thumbnail_url); ?>" alt="<?php echo esc_attr($post->post_title); ?>">
								<?php endif; ?>
							</a>
						</div>
						<?php if ($cat_name) : ?>
						<div class="category inline-flex items-center body-4 text-Primary-3 mt-3">
							<span><?php echo esc_html($cat_name); ?></span>
						</div>
						<?php endif; ?>
					</div>
					<div class="content text-white mt-3">
						<h3 class="heading-5 font-bold font-fontHeading uppercase mb-2">
							<a href="<?php echo esc_url($permalink); ?>"><?php echo esc_html($post->post_title); ?></a>
						</h3>
						<div class="date body-4 font-normal text-Secondary-1/60 mb-2"><?php echo esc_html($date); ?></div>
						<div class="format-content body-4 font-normal text-Secondary-1/70">
							<p><?php echo esc_html($excerpt); ?></p>
						</div>
					</div>
				</div>
				<?php endforeach; ?>
			</div>
			<?php endif; ?>
		</div>
	</div>
</section>

<?php
// — Popup: full content of the first post
if ($popup_post) :
	$popup_title = $popup_post->post_title;
	$popup_date  = get_the_date('d / m / Y', $popup_post->ID);
	$popup_content = apply_filters('the_content', $popup_post->post_content);
?>
<div id="popup-news" style="display: none;" data-fancybox-modal>
	<div class="popup-content rem:max-w-[1200px] w-full mx-auto">
		<div class="wrap-heading mb-5 pb-5 border-b border-b-Primary-1/20">
			<div class="title heading-3 font-bold font-fontHeading text-Primary-1"><?php echo esc_html($popup_title); ?></div>
			<div class="wrap-date mt-2 body-4 font-normal text-Primary-4"><?php echo esc_html($popup_date); ?></div>
		</div>
		<div class="format-content body-3 font-normal text-Primary-4">
			<?php echo wp_kses_post($popup_content); ?>
		</div>
	</div>
</div>
<?php endif; ?>
<?php wp_reset_postdata(); ?>
