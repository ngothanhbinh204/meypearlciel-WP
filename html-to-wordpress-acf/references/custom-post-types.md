# Custom Post Types Guide

Guide for creating and managing Custom Post Types in WordPress themes.

## When to Use Custom Post Types

Create a CPT when you have content that:
- Has unique fields different from standard posts
- Needs its own archive page
- Requires custom taxonomies
- Represents a distinct content type (projects, services, products, team members, etc.)

## Common CPT Examples

| Content Type | Slug | Use Case |
|--------------|------|----------|
| Projects | `project` | Portfolio items, case studies |
| Services | `service` | Service offerings |
| Products | `product` | Product catalog (if not using WooCommerce) |
| Team | `team` | Team members, staff profiles |
| Testimonials | `testimonial` | Client reviews |
| Jobs | `job` | Job listings, careers |
| Events | `event` | Upcoming events |
| FAQ | `faq` | Frequently asked questions |

## Registration Code

**Location:** `inc/function-post-types.php`

### Basic CPT Registration

```php
<?php
/**
 * Register Custom Post Types
 */

function theme_register_post_types() {
    
    // Projects CPT
    register_post_type('project', array(
        'labels' => array(
            'name'               => __('Projects', 'canhcamtheme'),
            'singular_name'      => __('Project', 'canhcamtheme'),
            'add_new'            => __('Add New', 'canhcamtheme'),
            'add_new_item'       => __('Add New Project', 'canhcamtheme'),
            'edit_item'          => __('Edit Project', 'canhcamtheme'),
            'new_item'           => __('New Project', 'canhcamtheme'),
            'view_item'          => __('View Project', 'canhcamtheme'),
            'search_items'       => __('Search Projects', 'canhcamtheme'),
            'not_found'          => __('No projects found', 'canhcamtheme'),
            'not_found_in_trash' => __('No projects found in Trash', 'canhcamtheme'),
            'all_items'          => __('All Projects', 'canhcamtheme'),
            'menu_name'          => __('Projects', 'canhcamtheme'),
        ),
        'public'              => true,
        'publicly_queryable'  => true,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'query_var'           => true,
        'rewrite'             => array('slug' => 'projects'),
        'capability_type'     => 'post',
        'has_archive'         => true,
        'hierarchical'        => false,
        'menu_position'       => 5,
        'menu_icon'           => 'dashicons-portfolio',
        'supports'            => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'show_in_rest'        => true, // Enable Gutenberg editor
    ));
    
}
add_action('init', 'theme_register_post_types');
```

### Multiple CPTs

```php
<?php
function theme_register_post_types() {
    
    // Services
    register_post_type('service', array(
        'labels' => array(
            'name'          => __('Services', 'canhcamtheme'),
            'singular_name' => __('Service', 'canhcamtheme'),
            'menu_name'     => __('Services', 'canhcamtheme'),
        ),
        'public'       => true,
        'has_archive'  => true,
        'rewrite'      => array('slug' => 'services'),
        'menu_icon'    => 'dashicons-admin-tools',
        'supports'     => array('title', 'editor', 'thumbnail', 'excerpt'),
        'show_in_rest' => true,
    ));
    
    // Team Members
    register_post_type('team', array(
        'labels' => array(
            'name'          => __('Team Members', 'canhcamtheme'),
            'singular_name' => __('Team Member', 'canhcamtheme'),
            'menu_name'     => __('Team', 'canhcamtheme'),
        ),
        'public'       => true,
        'has_archive'  => true,
        'rewrite'      => array('slug' => 'team'),
        'menu_icon'    => 'dashicons-groups',
        'supports'     => array('title', 'editor', 'thumbnail'),
        'show_in_rest' => true,
    ));
    
    // Testimonials
    register_post_type('testimonial', array(
        'labels' => array(
            'name'          => __('Testimonials', 'canhcamtheme'),
            'singular_name' => __('Testimonial', 'canhcamtheme'),
            'menu_name'     => __('Testimonials', 'canhcamtheme'),
        ),
        'public'       => true,
        'has_archive'  => false, // Usually displayed embedded, not on own page
        'rewrite'      => array('slug' => 'testimonials'),
        'menu_icon'    => 'dashicons-format-quote',
        'supports'     => array('title', 'editor', 'thumbnail'),
        'show_in_rest' => true,
    ));
    
}
add_action('init', 'theme_register_post_types');
```

## Custom Taxonomies

Add categories/tags to your CPT:

```php
<?php
function theme_register_taxonomies() {
    
    // Project Categories
    register_taxonomy('project_category', 'project', array(
        'labels' => array(
            'name'          => __('Project Categories', 'canhcamtheme'),
            'singular_name' => __('Project Category', 'canhcamtheme'),
            'menu_name'     => __('Categories', 'canhcamtheme'),
        ),
        'hierarchical'      => true, // Like categories
        'public'            => true,
        'show_in_nav_menus' => true,
        'show_admin_column' => true,
        'rewrite'           => array('slug' => 'project-category'),
        'show_in_rest'      => true,
    ));
    
    // Service Tags
    register_taxonomy('service_tag', 'service', array(
        'labels' => array(
            'name'          => __('Service Tags', 'canhcamtheme'),
            'singular_name' => __('Service Tag', 'canhcamtheme'),
            'menu_name'     => __('Tags', 'canhcamtheme'),
        ),
        'hierarchical'      => false, // Like tags
        'public'            => true,
        'show_in_nav_menus' => true,
        'show_admin_column' => true,
        'rewrite'           => array('slug' => 'service-tag'),
        'show_in_rest'      => true,
    ));
    
}
add_action('init', 'theme_register_taxonomies');
```

## Template Files for CPT

### Archive Template

**File:** `archive-project.php`

```php
<?php
/**
 * Template Name: Projects Archive
 * Description: Display all projects
 */

get_header(); ?>

<main class="projects-archive">
    <div class="container">
        <header class="archive-header">
            <h1><?php post_type_archive_title(); ?></h1>
            
            <?php if (term_description()): ?>
                <div class="archive-description">
                    <?php echo term_description(); ?>
                </div>
            <?php endif; ?>
        </header>
        
        <?php if (have_posts()): ?>
            <div class="projects-grid">
                <?php while (have_posts()): the_post(); ?>
                    <article id="post-<?php the_ID(); ?>" <?php post_class('project-card'); ?>>
                        <?php if (has_post_thumbnail()): ?>
                            <a href="<?php the_permalink(); ?>" class="project-card__image">
                                <?php echo get_image_post(get_the_ID(), 'image'); ?>
                            </a>
                        <?php endif; ?>
                        
                        <div class="project-card__content">
                            <h2 class="project-card__title">
                                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                            </h2>
                            
                            <?php if (has_excerpt()): ?>
                                <div class="project-card__excerpt">
                                    <?php the_excerpt(); ?>
                                </div>
                            <?php endif; ?>
                            
                            <a href="<?php the_permalink(); ?>" class="project-card__link">
                                <?php _e('View Project', 'canhcamtheme'); ?>
                            </a>
                        </div>
                    </article>
                <?php endwhile; ?>
            </div>
            
            <?php
            // Pagination
            the_posts_pagination(array(
                'prev_text' => __('Previous', 'canhcamtheme'),
                'next_text' => __('Next', 'canhcamtheme'),
            ));
            ?>
            
        <?php else: ?>
            <p><?php _e('No projects found.', 'canhcamtheme'); ?></p>
        <?php endif; ?>
    </div>
</main>

<?php get_footer(); ?>
```

### Single Template

**File:** `single-project.php`

```php
<?php
/**
 * Single Project Template
 */

get_header(); ?>

<main class="project-single">
    <?php while (have_posts()): the_post(); ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
            
            <!-- Hero Section -->
            <?php if (has_post_thumbnail()): ?>
                <div class="project-hero">
                    <?php echo get_image_post(get_the_ID(), 'image'); ?>
                </div>
            <?php endif; ?>
            
            <div class="container">
                <!-- Project Header -->
                <header class="project-header">
                    <h1><?php the_title(); ?></h1>
                    
                    <!-- Project Meta -->
                    <div class="project-meta">
                        <?php
                        // Custom fields from ACF
                        $client = get_field('project_client');
                        $date = get_field('project_date');
                        $url = get_field('project_url');
                        ?>
                        
                        <?php if ($client): ?>
                            <span class="meta-item">
                                <strong><?php _e('Client:', 'canhcamtheme'); ?></strong>
                                <?php echo esc_html($client); ?>
                            </span>
                        <?php endif; ?>
                        
                        <?php if ($date): ?>
                            <span class="meta-item">
                                <strong><?php _e('Date:', 'canhcamtheme'); ?></strong>
                                <?php echo esc_html($date); ?>
                            </span>
                        <?php endif; ?>
                        
                        <?php if ($url): ?>
                            <a href="<?php echo esc_url($url); ?>" class="meta-item" target="_blank">
                                <?php _e('Visit Website', 'canhcamtheme'); ?>
                            </a>
                        <?php endif; ?>
                    </div>
                    
                    <!-- Categories -->
                    <?php
                    $categories = get_the_terms(get_the_ID(), 'project_category');
                    if ($categories && !is_wp_error($categories)):
                    ?>
                        <div class="project-categories">
                            <?php foreach ($categories as $category): ?>
                                <a href="<?php echo esc_url(get_term_link($category)); ?>" class="category-tag">
                                    <?php echo esc_html($category->name); ?>
                                </a>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </header>
                
                <!-- Project Content -->
                <div class="project-content">
                    <?php the_content(); ?>
                </div>
                
                <!-- ACF Custom Sections -->
                <?php get_template_part('template-parts/section/project-gallery'); ?>
                <?php get_template_part('template-parts/section/project-features'); ?>
                <?php get_template_part('template-parts/section/project-results'); ?>
                
                <!-- Navigation -->
                <nav class="project-navigation">
                    <div class="nav-previous">
                        <?php previous_post_link('%link', '← %title', true, '', 'project_category'); ?>
                    </div>
                    <div class="nav-next">
                        <?php next_post_link('%link', '%title →', true, '', 'project_category'); ?>
                    </div>
                </nav>
            </div>
            
        </article>
    <?php endwhile; ?>
</main>

<?php get_footer(); ?>
```

### Taxonomy Archive Template

**File:** `taxonomy-project_category.php`

```php
<?php
/**
 * Project Category Archive
 */

get_header();

$term = get_queried_object();
?>

<main class="taxonomy-archive">
    <div class="container">
        <header class="archive-header">
            <h1><?php echo esc_html($term->name); ?></h1>
            
            <?php if ($term->description): ?>
                <div class="archive-description">
                    <?php echo wp_kses_post($term->description); ?>
                </div>
            <?php endif; ?>
        </header>
        
        <?php if (have_posts()): ?>
            <div class="projects-grid">
                <?php while (have_posts()): the_post(); ?>
                    <?php get_template_part('template-parts/content', 'project'); ?>
                <?php endwhile; ?>
            </div>
            
            <?php the_posts_pagination(); ?>
        <?php endif; ?>
    </div>
</main>

<?php get_footer(); ?>
```

## Querying CPTs

### Basic Query

```php
<?php
$projects = new WP_Query(array(
    'post_type'      => 'project',
    'posts_per_page' => 6,
    'orderby'        => 'date',
    'order'          => 'DESC',
));

if ($projects->have_posts()): ?>
    <div class="projects-list">
        <?php while ($projects->have_posts()): $projects->the_post(); ?>
            <div class="project-item">
                <h3><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h3>
                <?php the_excerpt(); ?>
            </div>
        <?php endwhile; ?>
    </div>
<?php endif;

wp_reset_postdata(); // IMPORTANT: Reset post data
?>
```

### Query with Taxonomy Filter

```php
<?php
$args = array(
    'post_type' => 'project',
    'tax_query' => array(
        array(
            'taxonomy' => 'project_category',
            'field'    => 'slug',
            'terms'    => 'web-design',
        ),
    ),
    'posts_per_page' => 8,
);

$projects = new WP_Query($args);
?>
```

### Query with Meta Field

```php
<?php
$args = array(
    'post_type'  => 'project',
    'meta_query' => array(
        array(
            'key'     => 'featured_project',
            'value'   => '1',
            'compare' => '=',
        ),
    ),
    'posts_per_page' => 3,
);

$featured_projects = new WP_Query($args);
?>
```

## ACF Integration

ACF field groups location for CPT:

```json
"location": [
    [
        {
            "param": "post_type",
            "operator": "==",
            "value": "project"
        }
    ]
]
```

## Best Practices

1. **Rewrite Slugs:** Use plural for archives (`projects`), consistent naming
2. **Supports:** Only enable what you need to simplify the admin
3. **Menu Icons:** Use dashicons for consistent admin UI
4. **REST API:** Enable `show_in_rest` for Gutenberg and headless use
5. **Flush Rewrite Rules:** Visit Settings → Permalinks after registering new CPT
6. **Never use `query_posts()`:** Always use `WP_Query` or `get_posts()`
7. **Reset Post Data:** Always call `wp_reset_postdata()` after custom queries

## After Registration

1. Visit **Settings → Permalinks** to flush rewrite rules
2. Create ACF field groups for the CPT
3. Create template files (`archive-{posttype}.php`, `single-{posttype}.php`)
4. Add menu items to navigation if needed
