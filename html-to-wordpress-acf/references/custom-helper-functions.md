# Custom Helper Functions

This theme includes custom helper functions for optimized image rendering with lazy loading support.

## Image Rendering Functions

### `get_image_attrachment($image, $type = "image")`

**Purpose:** Render ACF image fields with automatic lazy loading optimization.

**Parameters:**
- `$image` (array|int) - ACF image array or attachment ID
- `$type` (string) - Return type: `'image'` for HTML tag, `'url'` for URL only

**Returns:** 
- `'image'`: HTML `<img>` tag with lazy loading attributes
- `'url'`: Image URL string

**Features:**
- Automatically converts `src` to `data-src` for lazy loading
- Adds `lozad` class for lazy loading library
- Handles both ACF image arrays and attachment IDs
- Includes proper alt and title attributes
- URL escaping built-in

**Usage Examples:**

```php
// Get ACF image field
$hero_image = get_field('hero_image');

// Render as <img> tag with lazy loading
<?php if ($hero_image): ?>
    <?php echo get_image_attrachment($hero_image, 'image'); ?>
<?php endif; ?>

// Get URL only (for backgrounds, etc.)
<?php 
$background_url = get_image_attrachment(get_field('section_bg'), 'url');
if ($background_url):
?>
    <section style="background-image: url('<?php echo esc_url($background_url); ?>');">
        <!-- Content -->
    </section>
<?php endif; ?>

// With attachment ID
<?php
$logo_id = get_field('logo'); // Returns ID
echo get_image_attrachment($logo_id, 'image');
?>
```

**Output Example:**

```html
<!-- Input ACF Array -->
$image = array(
    'ID' => 123,
    'url' => 'https://example.com/image.jpg',
    'alt' => 'Sample Image',
    'title' => 'Sample Title'
);

<!-- Output HTML -->
<img data-src="https://example.com/image.jpg" 
     class="lozad" 
     alt="Sample Image" 
     title="Sample Title">
```

**When to Use:**
- ✅ ACF image fields in sections
- ✅ ACF repeater sub-fields (icons, photos)
- ✅ ACF Options page images (logo, banners)
- ✅ Background images (use `'url'` type)
- ❌ Not for post thumbnails (use `get_image_post()` instead)

---

### `get_image_post($id, $type = "image")`

**Purpose:** Render WordPress post thumbnails with automatic lazy loading optimization.

**Parameters:**
- `$id` (int) - Post ID
- `$type` (string) - Return type: `'image'` for HTML tag, `'url'` for URL only

**Returns:**
- `'image'`: HTML `<img>` tag with lazy loading attributes
- `'url'`: Featured image URL string

**Features:**
- Automatically converts `src` to `data-src` for lazy loading
- Adds `lozad` class for lazy loading library
- Uses post title as fallback alt text
- Uses post thumbnail caption as alt if available
- Full-size image by default
- URL escaping built-in

**Usage Examples:**

```php
// Current post thumbnail
<?php if (has_post_thumbnail()): ?>
    <div class="post-thumbnail">
        <?php echo get_image_post(get_the_ID(), 'image'); ?>
    </div>
<?php endif; ?>

// In a loop
<?php while (have_posts()): the_post(); ?>
    <article class="post-card">
        <a href="<?php the_permalink(); ?>">
            <?php echo get_image_post(get_the_ID(), 'image'); ?>
        </a>
        <h2><?php the_title(); ?></h2>
    </article>
<?php endwhile; ?>

// Get URL only
<?php
$thumbnail_url = get_image_post(get_the_ID(), 'url');
?>
<div style="background-image: url('<?php echo esc_url($thumbnail_url); ?>');">
    <!-- Content -->
</div>

// Specific post by ID
<?php
$featured_post_id = 42;
echo get_image_post($featured_post_id, 'image');
?>
```

**Output Example:**

```html
<!-- Post has thumbnail with caption "Featured Image" and title "My Blog Post" -->

<!-- Output HTML -->
<img data-src="https://example.com/featured-image.jpg" 
     class="lozad" 
     alt="Featured Image" 
     title="My Blog Post">

<!-- If no caption, uses post title as alt -->
<img data-src="https://example.com/featured-image.jpg" 
     class="lozad" 
     alt="My Blog Post" 
     title="My Blog Post">
```

**When to Use:**
- ✅ Post thumbnails in archives
- ✅ Featured images in single posts
- ✅ Custom post type cards
- ✅ Related posts
- ✅ Recent posts widgets
- ❌ Not for ACF images (use `get_image_attrachment()` instead)

---

## Complete Usage Patterns

### Pattern 1: Hero Section with ACF Background

```php
<?php
// template-parts/section/hero.php

$hero_title = get_field('hero_title');
$hero_content = get_field('hero_content');
$hero_background = get_field('hero_background');

// Get background URL
$bg_url = $hero_background ? get_image_attrachment($hero_background, 'url') : '';
?>

<section class="hero" <?php if ($bg_url): ?>style="background-image: url('<?php echo esc_url($bg_url); ?>');"<?php endif; ?>>
    <div class="container">
        <?php if ($hero_title): ?>
            <h1><?php echo esc_html($hero_title); ?></h1>
        <?php endif; ?>
        
        <?php if ($hero_content): ?>
            <div><?php echo wp_kses_post($hero_content); ?></div>
        <?php endif; ?>
    </div>
</section>
```

### Pattern 2: Features Grid with ACF Repeater

```php
<?php
// template-parts/section/features.php

if (have_rows('features_list')): ?>
    <div class="features-grid">
        <?php while (have_rows('features_list')): the_row(); 
            $icon = get_sub_field('feature_icon');
            $title = get_sub_field('feature_title');
        ?>
            <div class="feature-item">
                <?php if ($icon): ?>
                    <div class="feature-icon">
                        <?php echo get_image_attrachment($icon, 'image'); ?>
                    </div>
                <?php endif; ?>
                
                <?php if ($title): ?>
                    <h3><?php echo esc_html($title); ?></h3>
                <?php endif; ?>
            </div>
        <?php endwhile; ?>
    </div>
<?php endif; ?>
```

### Pattern 3: Blog Archive with Post Thumbnails

```php
<?php
// archive.php

if (have_posts()): ?>
    <div class="posts-grid">
        <?php while (have_posts()): the_post(); ?>
            <article class="post-card">
                <?php if (has_post_thumbnail()): ?>
                    <a href="<?php the_permalink(); ?>" class="post-card__image">
                        <?php echo get_image_post(get_the_ID(), 'image'); ?>
                    </a>
                <?php endif; ?>
                
                <div class="post-card__content">
                    <h2><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                    <?php the_excerpt(); ?>
                </div>
            </article>
        <?php endwhile; ?>
    </div>
<?php endif; ?>
```

### Pattern 4: Custom Post Type with Mixed Images

```php
<?php
// single-project.php - Project detail page

// Post thumbnail
if (has_post_thumbnail()): ?>
    <div class="project-hero">
        <?php echo get_image_post(get_the_ID(), 'image'); ?>
    </div>
<?php endif; ?>

<div class="project-content">
    <?php the_content(); ?>
</div>

<!-- ACF Gallery -->
<?php 
$gallery = get_field('project_gallery'); // Repeater with images
if ($gallery): ?>
    <div class="project-gallery">
        <?php foreach ($gallery as $item): ?>
            <div class="gallery-item">
                <?php echo get_image_attrachment($item['image'], 'image'); ?>
            </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>
```

### Pattern 5: Options Page Logo

```php
<?php
// header.php

$logo = get_field('site_logo', 'option');
?>

<header class="site-header">
    <?php if ($logo): ?>
        <a href="<?php echo esc_url(home_url('/')); ?>" class="site-logo">
            <?php echo get_image_attrachment($logo, 'image'); ?>
        </a>
    <?php endif; ?>
    
    <nav class="main-nav">
        <?php wp_nav_menu(array('theme_location' => 'primary')); ?>
    </nav>
</header>
```

---

## Implementation Details

### Function Implementation

Both functions are located in `inc/function-root.php`:

```php
/**
 * Helper function to modify image attributes for lazy loading
 */
function changeAttrImage($url) {
    $image_output = $url;
    $image_output = str_replace('src', 'data-src', $image_output);
    $image_output = str_replace('class="', 'class="lozad ', $image_output);
    return $image_output;
}

/**
 * Get and render ACF image with lazy loading
 */
function get_image_attrachment($image, $type = "image") {
    if ($type == "image") {
        if (!empty($image['ID'])) {
            $alt = get_post_meta($image['ID'], '_wp_attachment_image_alt', true) != '' 
                ? get_post_meta($image['ID'], '_wp_attachment_image_alt', true) 
                : get_bloginfo('name');
            $url = wp_get_attachment_image($image['ID'], 'full', '', array(
                'class' => '', 
                'alt' => $alt, 
                'title' => $alt
            ));
            return changeAttrImage($url);
        } else {
            $url = wp_get_attachment_image($image, 'full', '', array('class' => ''));
            return changeAttrImage($url);
        }
    }
    
    if ($type == "url") {
        if (!empty($image['ID'])) {
            return wp_get_attachment_image_url($image['ID'], 'full');
        } else {
            return wp_get_attachment_image_url($image, 'full');
        }
    }
}

/**
 * Get and render post thumbnail with lazy loading
 */
function get_image_post($id, $type = "image") {
    if ($type == "image") {
        $alt = get_the_post_thumbnail_caption($id) != '' 
            ? get_the_post_thumbnail_caption($id) 
            : get_the_title($id);
        $url = get_the_post_thumbnail($id, 'full', array(
            'class' => '', 
            'alt' => $alt, 
            'title' => $alt
        ));
        return changeAttrImage($url);
    }
    
    if ($type == "url") {
        return get_the_post_thumbnail_url($id, 'full');
    }
}
```

### JavaScript Integration

These functions work with the Lozad.js lazy loading library. Ensure you include:

```javascript
// Initialize Lozad observer
const observer = lozad('.lozad', {
    rootMargin: '200px 0px', // Start loading 200px before entering viewport
    threshold: 0.1
});
observer.observe();
```

---

## Best Practices

### ✅ DO:

**Use appropriate function for image type:**
```php
// ACF images
<?php echo get_image_attrachment(get_field('image'), 'image'); ?>

// Post thumbnails
<?php echo get_image_post(get_the_ID(), 'image'); ?>
```

**Always check if image exists:**
```php
<?php 
$image = get_field('section_image');
if ($image): 
    echo get_image_attrachment($image, 'image');
endif; 
?>
```

**Use 'url' type for backgrounds:**
```php
<?php
$bg = get_image_attrachment(get_field('bg_image'), 'url');
if ($bg):
?>
    <div style="background-image: url('<?php echo esc_url($bg); ?>');">
<?php endif; ?>
```

### ❌ DON'T:

**Don't mix functions:**
```php
// ❌ Wrong - Using post function for ACF
<?php echo get_image_post(get_field('image')['ID'], 'image'); ?>

// ✔ Correct
<?php echo get_image_attrachment(get_field('image'), 'image'); ?>
```

**Don't manually create img tags:**
```php
// ❌ Wrong - Manual HTML
<img src="<?php echo $image['url']; ?>" alt="">

// ✔ Correct - Use helper function
<?php echo get_image_attrachment($image, 'image'); ?>
```

**Don't forget to escape URLs when using 'url' type:**
```php
// ❌ Wrong - No escaping
<div style="background: url(<?php echo get_image_post(get_the_ID(), 'url'); ?>)">

// ✔ Correct - Properly escaped
<div style="background: url('<?php echo esc_url(get_image_post(get_the_ID(), 'url')); ?>')">
```

---

## Troubleshooting

### Image not loading?

1. Verify the function exists in `inc/function-root.php`
2. Check Lozad.js is properly initialized
3. Ensure image field returns array format (not ID or URL)
4. Check browser console for JavaScript errors

### No lazy loading?

1. Verify Lozad.js library is enqueued
2. Check the output includes `data-src` and `lozad` class
3. Ensure JavaScript observer is initialized

### Alt text missing?

For ACF images:
- Set alt text in media library
- Fallback uses site name

For post thumbnails:
- Set caption on featured image
- Fallback uses post title

---

## Migration Guide

### From Standard WordPress Functions:

**Before:**
```php
<?php if ($image): ?>
    <img src="<?php echo esc_url($image['url']); ?>" 
         alt="<?php echo esc_attr($image['alt']); ?>">
<?php endif; ?>

<?php the_post_thumbnail('full'); ?>
```

**After:**
```php
<?php if ($image): ?>
    <?php echo get_image_attrachment($image, 'image'); ?>
<?php endif; ?>

<?php echo get_image_post(get_the_ID(), 'image'); ?>
```

### Benefits of Migration:

- ✅ Automatic lazy loading
- ✅ Improved page load performance
- ✅ Consistent image handling
- ✅ Built-in escaping
- ✅ Cleaner template code
