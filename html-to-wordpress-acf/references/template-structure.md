# WordPress Theme Template Structure

Complete guide to organizing WordPress theme files for maintainability and scalability.

## Core Template Files

### Required Files

```
style.css              # Theme metadata (required)
index.php              # Fallback template (required)
screenshot.png         # Theme screenshot 1200x900px (required)
```

### Common Template Files

```
functions.php          # Theme setup and functionality
header.php            # Site header
footer.php            # Site footer
sidebar.php           # Sidebar widget area
404.php               # 404 error page
search.php            # Search results
```

### Page Templates

```
front-page.php        # Static homepage (highest priority)
home.php              # Blog posts index
page.php              # Default page template
single.php            # Default single post
archive.php           # Archive pages (category, tag, date)
```

### Custom Page Templates

```php
<?php
/**
 * Template Name: About Page
 * Template Post Type: page
 */

get_header();
// Custom content
get_footer();
?>
```

## WordPress Template Hierarchy

### Page Template Selection (Priority Order)

```
1. page-{slug}.php         Example: page-about.php
2. page-{id}.php           Example: page-42.php
3. Custom Page Template    Created with "Template Name" header
4. page.php                Default page template
5. singular.php            Generic single content
6. index.php               Ultimate fallback
```

### Single Post Template

```
1. single-{posttype}-{slug}.php
2. single-{posttype}.php
3. single.php
4. singular.php
5. index.php
```

### Archive Template

```
1. archive-{posttype}.php
2. archive.php
3. index.php
```

### Taxonomy Template

```
1. taxonomy-{taxonomy}-{term}.php
2. taxonomy-{taxonomy}.php
3. taxonomy.php
4. archive.php
5. index.php
```

## Recommended Theme Structure

```
theme-name/
│
├── style.css                    # Required theme metadata
├── functions.php                # Theme setup
├── screenshot.png               # Theme screenshot
│
├── index.php                    # Fallback template
├── front-page.php               # Homepage
├── home.php                     # Blog index
├── page.php                     # Default page
├── single.php                   # Default single post
├── archive.php                  # Default archive
├── search.php                   # Search results
├── 404.php                      # Not found
│
├── header.php                   # Global header
├── footer.php                   # Global footer
├── sidebar.php                  # Sidebar
├── comments.php                 # Comments template
│
├── page-about.php               # About page (by slug)
├── page-contact.php             # Contact page
│
├── single-project.php           # Single project CPT
├── archive-project.php          # Projects archive
├── taxonomy-project_category.php # Project category archive
│
├── acf-json/                    # ACF field group JSON files
│   ├── group_home_hero.json
│   ├── group_home_features.json
│   └── group_header_settings.json
│
├── inc/                         # Theme functionality
│   ├── function-setup.php       # Theme setup, enqueue
│   ├── function-post-types.php  # Custom post types
│   ├── function-field.php       # ACF helpers
│   ├── function-pagination.php  # Pagination
│   ├── function-custom.php      # Custom functions
│   └── function-root.php        # Additional utilities
│
├── template-parts/              # Reusable template parts
│   ├── section/                 # Page sections
│   │   ├── hero.php
│   │   ├── about.php
│   │   ├── services.php
│   │   ├── features.php
│   │   ├── testimonials.php
│   │   ├── projects.php
│   │   ├── cta.php
│   │   └── contact.php
│   │
│   ├── component/               # Small components
│   │   ├── button.php
│   │   ├── card.php
│   │   └── breadcrumb.php
│   │
│   └── content/                 # Post content variations
│       ├── content.php          # Default post content
│       ├── content-project.php  # Project post content
│       └── content-none.php     # No content found
│
├── modules/                     # Complex modules (alternative to template-parts)
│   └── common/
│       └── banner.php
│
├── UI/                          # Original HTML files (for reference)
│   ├── home.html
│   ├── about.html
│   ├── contact.html
│   └── assets/
│
├── assets/                      # Theme assets
│   ├── css/
│   │   └── main.css
│   ├── js/
│   │   └── main.js
│   └── images/
│       └── logo.png
│
└── languages/                   # Translation files
    └── canhcamtheme.pot
```

## Template Parts Organization

### Using `get_template_part()`

**Basic usage:**
```php
<?php get_template_part('template-parts/section/hero'); ?>
```

**With slug and name:**
```php
<?php get_template_part('template-parts/content', 'project'); ?>
// Looks for: template-parts/content-project.php
```

**Pass variables (WP 5.5+):**
```php
<?php 
get_template_part('template-parts/section/cta', null, array(
    'title' => 'Get Started Today',
    'button_text' => 'Contact Us'
));
?>

// In template-parts/section/cta.php:
<?php
$args = wp_parse_args($args, array(
    'title' => '',
    'button_text' => 'Learn More'
));
?>
<section class="cta">
    <?php if ($args['title']): ?>
        <h2><?php echo esc_html($args['title']); ?></h2>
    <?php endif; ?>
</section>
```

## Example Templates

### front-page.php (Homepage)

```php
<?php
/**
 * Homepage Template
 */

get_header(); ?>

<main class="homepage">
    <?php
    // Load section template parts
    get_template_part('template-parts/section/hero');
    get_template_part('template-parts/section/about');
    get_template_part('template-parts/section/services');
    get_template_part('template-parts/section/features');
    get_template_part('template-parts/section/testimonials');
    get_template_part('template-parts/section/projects');
    get_template_part('template-parts/section/cta');
    get_template_part('template-parts/section/contact');
    ?>
</main>

<?php get_footer(); ?>
```

### page-about.php (About Page)

```php
<?php
/**
 * About Page Template
 */

get_header(); ?>

<main class="about-page">
    <?php while (have_posts()): the_post(); ?>
        
        <!-- Page Header -->
        <section class="page-header">
            <div class="container">
                <h1><?php the_title(); ?></h1>
            </div>
        </section>
        
        <!-- ACF Sections -->
        <?php get_template_part('template-parts/section/about-intro'); ?>
        <?php get_template_part('template-parts/section/about-mission'); ?>
        <?php get_template_part('template-parts/section/about-team'); ?>
        <?php get_template_part('template-parts/section/about-values'); ?>
        
    <?php endwhile; ?>
</main>

<?php get_footer(); ?>
```

### Section Template Part Example

**File:** `template-parts/section/hero.php`

```php
<?php
/**
 * Hero Section
 */

$hero_title = get_field('hero_title');
$hero_content = get_field('hero_content');
$hero_button = get_field('hero_button');
$hero_background = get_field('hero_background');

// Don't render if no content
if (!$hero_title && !$hero_content) {
    return;
}
?>

<section class="hero" <?php if ($hero_background): ?>style="background-image: url('<?php echo esc_url($hero_background['url']); ?>');"<?php endif; ?>>
    <div class="container">
        <div class="hero__content">
            <?php if ($hero_title): ?>
                <h1 class="hero__title"><?php echo esc_html($hero_title); ?></h1>
            <?php endif; ?>
            
            <?php if ($hero_content): ?>
                <div class="hero__text"><?php echo wp_kses_post($hero_content); ?></div>
            <?php endif; ?>
            
            <?php if ($hero_button): ?>
                <a href="<?php echo esc_url($hero_button['url']); ?>" 
                   class="hero__button btn btn--primary"
                   <?php if ($hero_button['target']): ?>target="<?php echo esc_attr($hero_button['target']); ?>"<?php endif; ?>>
                    <?php echo esc_html($hero_button['title']); ?>
                </a>
            <?php endif; ?>
        </div>
    </div>
</section>
```

## Conditional Template Loading

```php
<?php
// Load different sections based on ACF true/false fields
if (get_field('show_hero')) {
    get_template_part('template-parts/section/hero');
}

if (get_field('show_services')) {
    get_template_part('template-parts/section/services');
}

if (get_field('show_testimonials')) {
    get_template_part('template-parts/section/testimonials');
}
?>
```

## Template Tags Reference

### Header & Footer

```php
get_header();          // Includes header.php
get_footer();          // Includes footer.php
get_sidebar();         // Includes sidebar.php
```

### Template Parts

```php
get_template_part($slug);
get_template_part($slug, $name);
get_template_part($slug, $name, $args);
```

### WordPress Loop

```php
<?php if (have_posts()): ?>
    <?php while (have_posts()): the_post(); ?>
        <?php the_title(); ?>
        <?php the_content(); ?>
    <?php endwhile; ?>
<?php else: ?>
    <p>No content found.</p>
<?php endif; ?>
```

### Post Functions

```php
the_title();           // Post title
the_content();         // Post content
the_excerpt();         // Post excerpt
the_permalink();       // Post URL
the_post_thumbnail();  // Featured image
the_ID();              // Post ID
```

### Conditional Tags

```php
is_front_page();       // Homepage
is_home();             // Blog index
is_page();             // Any page
is_page('about');      // Specific page by slug
is_single();           // Single post
is_archive();          // Archive page
is_404();              // 404 page
is_search();           // Search results
```

## Best Practices

1. **Modular Structure**
   - Break pages into reusable sections
   - Use `template-parts/` for organization
   - Keep template files clean and focused

2. **Naming Conventions**
   - Use descriptive, lowercase filenames
   - Use hyphens for multi-word names
   - Prefix custom templates clearly

3. **Don't Repeat Yourself (DRY)**
   - Reuse template parts across pages
   - Abstract common functionality to `inc/`
   - Use helper functions for repetitive tasks

4. **Comments**
   - Document what each template does
   - Explain complex logic
   - Note ACF fields being used

5. **Validation**
   - Always check if data exists before output
   - Use proper escaping functions
   - Provide fallbacks for missing content

6. **Performance**
   - Minimize database queries
   - Use transients for expensive operations
   - Optimize images and assets

7. **Maintainability**
   - Clear folder structure
   - Consistent coding style
   - Separation of concerns (template vs logic)
