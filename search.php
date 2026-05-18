<?php get_header() ?>

<div class="single-frame">
	<section class="search-page section" setbackground="/wp-content/themes/forestBay/img/TinTuc/news-bg.jpg">
		<div class="container max-w-screen-2xl">
			<h1 class="block-title text-center mb-30px">Tìm kiếm</h1>
			<div class="search-query">Kết quả tìm kiếm từ khóa: " <span><?php echo get_search_query() ?></span> "</div>
			<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-30px">
				<?php if (have_posts()) : ?>
					<?php while (have_posts()) : the_post() ?>
						<div class="item">
							<div class="box-news transition-all">
								<div class="img relative transition-all">
									<a href="<?php echo get_page_link(get_the_ID()) ?>">
										<img loading="lazy" src="<?php echo get_the_post_thumbnail_url(get_the_ID()) ?>">
									</a>
									<div class="date transition-all">
										<span>
											<?php
											echo get_the_date('d', $new->ID)
											?>
										</span>
										<span>
											<?php
											echo get_the_date('m - Y', $new->ID)
											?></span>
									</div>
								</div>
								<div class="content mt-15px text-white">
									<a class="title text-lg leading-24px" href="<?php echo get_page_link(get_the_ID()) ?>">
										<?php the_title() ?>
									</a>
									<div class="button"> <a class="btn btn-2" href="<?php echo get_page_link(get_the_ID()) ?>">Xem thêm</a></div>
								</div>
							</div>
						</div>
					<?php endwhile; ?>
				<?php endif; ?>
			</div>
		</div>
	</section>
</div>
<?php get_footer() ?>