# ACF Field Patterns & Best Practices

Common ACF field patterns for WordPress theme development.

## Basic Field Types

### Text Field

**Use for:** Short, single-line text (titles, names, labels)

```php
// Get
$title = get_field('section_title');

// Render
<?php if ($title): ?>
    <h2><?php echo esc_html($title); ?></h2>
<?php endif; ?>
```

### Textarea Field

**Use for:** Multi-line plain text without formatting

```php
// Get
$description = get_field('section_description');

// Render
<?php if ($description): ?>
    <p><?php echo esc_html($description); ?></p>
<?php endif; ?>
```

### WYSIWYG Field

**Use for:** Rich text content with formatting (paragraphs, lists, bold, italic)

**Important:** Use `<div>` not `<p>` tags to wrap WYSIWYG content

```php
// Get
$content = get_field('section_content');

// Render - CORRECT
<?php if ($content): ?>
    <div class="content"><?php echo wp_kses_post($content); ?></div>
<?php endif; ?>

// Render - WRONG (content may escape <p> tag)
<?php if ($content): ?>
    <p class="content"><?php echo wp_kses_post($content); ?></p>
<?php endif; ?>
```

### Link Field

**Use for:** Buttons, CTAs, navigation links

**Return format:** Array

```php
// Get
$button = get_field('cta_button');

// Render
<?php if ($button): ?>
    <a href="<?php echo esc_url($button['url']); ?>" 
       class="btn"
       <?php if ($button['target']): ?>target="<?php echo esc_attr($button['target']); ?>"<?php endif; ?>>
        <?php echo esc_html($button['title']); ?>
    </a>
<?php endif; ?>
```

### Image Field

**Use for:** All images (backgrounds, icons, photos)

**Return format:** Array (recommended)

**IMPORTANT:** Use `get_image_attrachment()` for all ACF images (includes lazy loading optimization)

```php
// Get
$image = get_field('section_image');

// Render - Using custom function (RECOMMENDED)
<?php if ($image): ?>
    <?php echo get_image_attrachment($image, 'image'); ?>
<?php endif; ?>

// Get URL only
<?php 
$image_url = get_image_attrachment(get_field('section_image'), 'url');
?>

// Render - Background image (use URL type)
<?php 
$background = get_field('hero_background');
if ($background): 
    $bg_url = get_image_attrachment($background, 'url');
?>
    <section class="hero" style="background-image: url('<?php echo esc_url($bg_url); ?>');">
        <!-- Content -->
    </section>
<?php endif; ?>

// Manual render (if custom function not available)
<?php if ($image): ?>
    <img src="<?php echo esc_url($image['url']); ?>" 
         alt="<?php echo esc_attr($image['alt']); ?>"
         width="<?php echo esc_attr($image['width']); ?>"
         height="<?php echo esc_attr($image['height']); ?>">
<?php endif; ?>
```

**Custom Image Functions:**

```php
/**
 * get_image_attrachment() - For ACF images
 * Automatically adds lazy loading (data-src, lozad class)
 * 
 * @param array|int $image ACF image array or attachment ID
 * @param string $type 'image' for <img> tag, 'url' for URL only
 * @return string HTML img tag or URL
 */
$image = get_field('section_image');
echo get_image_attrachment($image, 'image'); // Returns <img> with lazy loading
echo get_image_attrachment($image, 'url');   // Returns image URL only

/**
 * get_image_post() - For post thumbnails
 * Automatically adds lazy loading (data-src, lozad class)
 * 
 * @param int $id Post ID
 * @param string $type 'image' for <img> tag, 'url' for URL only
 * @return string HTML img tag or URL
 */
echo get_image_post(get_the_ID(), 'image'); // Returns <img> with lazy loading
echo get_image_post(get_the_ID(), 'url');   // Returns featured image URL only
```

### True/False Field

**Use for:** Toggle sections on/off, enable/disable features

```php
// Get
$show_section = get_field('show_testimonials');

// Render
<?php if ($show_section): ?>
    <section class="testimonials">
        <!-- Section content -->
    </section>
<?php endif; ?>
```

### Select Field

**Use for:** Dropdown choices (layouts, colors, styles)

```php
// Get
$layout = get_field('section_layout'); // Returns: 'grid', 'list', 'slider'

// Render
<div class="features features--<?php echo esc_attr($layout); ?>">
    <!-- Content adapts based on layout -->
</div>
```

## Advanced Patterns

### Repeater Field

**Use for:** Lists, grids, sliders, any repeating content

**Example: Feature List**

```php
<?php if (have_rows('features_list')): ?>
    <div class="features">
        <?php while (have_rows('features_list')): the_row(); 
            $icon = get_sub_field('feature_icon');
            $title = get_sub_field('feature_title');
            $description = get_sub_field('feature_description');
        ?>
            <div class="feature-item">
                <?php if ($icon): ?>
                    <?php echo get_image_attrachment($icon, 'image'); ?>
                <?php endif; ?>
                
                <?php if ($title): ?>
                    <h3><?php echo esc_html($title); ?></h3>
                <?php endif; ?>
                
                <?php if ($description): ?>
                    <div><?php echo wp_kses_post($description); ?></div>
                <?php endif; ?>
            </div>
        <?php endwhile; ?>
    </div>
<?php endif; ?>
```

**Example: Team Members Grid**

```php
<?php if (have_rows('team_members')): ?>
    <div class="team-grid">
        <?php while (have_rows('team_members')): the_row(); 
            $photo = get_sub_field('member_photo');
            $name = get_sub_field('member_name');
            $position = get_sub_field('member_position');
            $bio = get_sub_field('member_bio');
            $social = get_sub_field('member_social_links'); // Link field
        ?>
            <div class="team-member">
                <?php if ($photo): ?>
                    <img src="<?php echo esc_url($photo['sizes']['medium']); ?>" 
                     ?php echo get_image_attrachment($photo, 'image'); ?
                
                <div class="team-member__info">
                    <?php if ($name): ?>
                        <h3><?php echo esc_html($name); ?></h3>
                    <?php endif; ?>
                    
                    <?php if ($position): ?>
                        <p class="position"><?php echo esc_html($position); ?></p>
                    <?php endif; ?>
                    
                    <?php if ($bio): ?>
                        <div class="bio"><?php echo wp_kses_post($bio); ?></div>
                    <?php endif; ?>
                    
                    <?php if ($social): ?>
                        <a href="<?php echo esc_url($social['url']); ?>" 
                           class="social-link"
                           <?php if ($social['target']): ?>target="<?php echo esc_attr($social['target']); ?>"<?php endif; ?>>
                            <?php echo esc_html($social['title']); ?>
                        </a>
                    <?php endif; ?>
                </div>
            </div>
        <?php endwhile; ?>
    </div>
<?php endif; ?>
```

**Example: Slider/Carousel**

```php
<?php if (have_rows('testimonials')): ?>
    <div class="testimonials-slider">
        <?php while (have_rows('testimonials')): the_row(); 
            $quote = get_sub_field('testimonial_quote');
            $author = get_sub_field('testimonial_author');
            $company = get_sub_field('testimonial_company');
            $avatar = get_sub_field('testimonial_avatar');
        ?>
            <div class="testimonial-slide">
                <?php if ($quote): ?>
                    <blockquote><?php echo wp_kses_post($quote); ?></blockquote>
                <?php endif; ?>
                
                <div class="testimonial-author">
                    <?php if ($avatar): ?>
                        <img src="<?php echo esc_url($avatar['sizes']['thumbnail']); ?>" 
                             alt="<?php echo esc_attr($author); ?>">
                    <?php?php echo get_image_attrachment($avatar, 'image'); ?
                    <div class="author-info">
                        <?php if ($author): ?>
                            <strong><?php echo esc_html($author); ?></strong>
                        <?php endif; ?>
                        
                        <?php if ($company): ?>
                            <span><?php echo esc_html($company); ?></span>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        <?php endwhile; ?>
    </div>
<?php endif; ?>
```

### Flexible Content (Page Builder Pattern)

**Use for:** Mixed content sections with different layouts

```php
<?php if (have_rows('content_blocks')): ?>
    <?php while (have_rows('content_blocks')): the_row(); ?>
        
        <?php if (get_row_layout() == 'hero'): ?>
            <?php get_template_part('template-parts/blocks/hero'); ?>
        
        <?php elseif (get_row_layout() == 'text_image'): ?>
            <?php get_template_part('template-parts/blocks/text-image'); ?>
        
        <?php elseif (get_row_layout() == 'features_grid'): ?>
            <?php get_template_part('template-parts/blocks/features'); ?>
        
        <?php elseif (get_row_layout() == 'cta'): ?>
            <?php get_template_part('template-parts/blocks/cta'); ?>
        
        <?php endif; ?>
        
    <?php endwhile; ?>
<?php endif; ?>
```

### Group Field

**Use for:** Grouping related fields together

```php
// Get group
$contact_info = get_field('contact_info');

// Render
<?php if ($contact_info): ?>
    <div class="contact">
        <?php if ($contact_info['phone']): ?>
            <a href="tel:<?php echo esc_attr($contact_info['phone']); ?>">
                <?php echo esc_html($contact_info['phone']); ?>
            </a>
        <?php endif; ?>
        
        <?php if ($contact_info['email']): ?>
            <a href="mailto:<?php echo esc_attr($contact_info['email']); ?>">
                <?php echo esc_html($contact_info['email']); ?>
            </a>
        <?php endif; ?>
        
        <?php if ($contact_info['address']): ?>
            <address><?php echo esc_html($contact_info['address']); ?></address>
        <?php endif; ?>
    </div>
<?php endif; ?>
```

## Options Page Patterns

### Header Settings

```php
// header.php

$logo = get_field('site_logo', 'option');
$phone = get_field('phone_number', 'option');
$email = get_field('email_address', 'option');

<?php if ($logo): ?>
    <a href="<?php echo esc_url(home_url('/')); ?>" class="site-logo">
        <img src="<?php echo esc_url($logo['url']); ?>" 
             alt="<?php echo esc_attr(get_bloginfo('name')); ?>">
    </a>?php echo get_image_attrachment($logo, 'image'); ?
```

### Footer Settings

```php
// footer.php

$footer_text = get_field('footer_copyright', 'option');
$social_links = get_field('social_media_links', 'option'); // Repeater

<?php if (have_rows('social_media_links', 'option')): ?>
    <div class="social-links">
        <?php while (have_rows('social_media_links', 'option')): the_row(); 
            $platform = get_sub_field('platform'); // Select: facebook, twitter, instagram, etc.
            $url = get_sub_field('url');
        ?>
            <a href="<?php echo esc_url($url); ?>" 
               class="social-link social-link--<?php echo esc_attr($platform); ?>"
               target="_blank" 
               rel="noopener noreferrer">
                <i class="icon-<?php echo esc_attr($platform); ?>"></i>
            </a>
        <?php endwhile; ?>
    </div>
<?php endif; ?>
```

## Conditional Logic Patterns

### Show/Hide Sections

```php
$show_section = get_field('display_section');
$section_title = get_field('section_title');
$section_content = get_field('section_content');

<?php if ($show_section && ($section_title || $section_content)): ?>
    <section class="custom-section">
        <?php if ($section_title): ?>
            <h2><?php echo esc_html($section_title); ?></h2>
        <?php endif; ?>
        
        <?php if ($section_content): ?>
            <div><?php echo wp_kses_post($section_content); ?></div>
        <?php endif; ?>
    </section>
<?php endif; ?>
```

### Layout Variations

```php
$layout = get_field('section_layout'); // 'left', 'right', 'center'
$image = get_field('section_image');
$content = get_field('section_content');

<section class="content-section content-section--<?php echo esc_attr($layout); ?>">
    <?php if ($layout == 'left' || $layout == 'right'): ?>
        <div class="content-section__image">
            <?php if ($image): ?>
                <img src="<?php echo esc_url($image['url']); ?>" 
                     alt="<?php echo esc_attr($image['alt']); ?>">
            <?php endif; ?>
        </div>
    <?php endif; ?>
    
    <div class="content-section__text">
        <?php if ($content): ?>
            <?php echo wp_kses_post($content); ?>
        <?php endif; ?>
    </div>
</section>
```

## Best Practices

### 1. Always Check Before Output

```php
// ✔ CORRECT
<?php if (get_field('title')): ?>
    <h2><?php echo esc_html(get_field('title')); ?></h2>
<?php endif; ?>

// ❌ WRONG - No check
<h2><?php echo esc_html(get_field('title')); ?></h2>
```

### 2. Use Proper Escaping

```php
esc_html()      // Plain text
esc_url()       // URLs
esc_attr()      // HTML attributes
wp_kses_post()  // WYSIWYG content
```

### 3. Store in Variables for Repeater

```php
// ✔ CORRECT - Store in variable
<?php while (have_rows('items')): the_row(); 
    $title = get_sub_field('title');
    $image = get_sub_field('image');
?>
    <?php if ($title): ?>
        <h3><?php echo esc_html($title); ?></h3>
    <?php endif; ?>
<?php endwhile; ?>

// ❌ WRONG - Multiple get_sub_field() calls
<?php while (have_rows('items')): the_row(); ?>
    <?php if (get_sub_field('title')): ?>
        <h3><?php echo esc_html(get_sub_field('title')); ?></h3>
    <?php endif; ?>
<?php endwhile; ?>
```

### 4. Provide Fallbacks

```php
// Image with fallback
$image = get_field('featured_image');
$fallback = get_template_directory_uri() . '/assets/images/default.jpg';

<img src="<?php echo esc_url($image ? $image['url'] : $fallback); ?>" 
     alt="<?php echo esc_attr($image ? $image['alt'] : ''); ?>">
```

### 5. Button/Link Pattern

```php
// Reusable button component
function render_acf_button($button, $classes = 'btn') {
    if (!$button) return;
    
    printf(
        '<a href="%s" class="%s"%s>%s</a>',
        esc_url($button['url']),
        esc_attr($classes),
        $button['target'] ? ' target="' . esc_attr($button['target']) . '"' : '',
        esc_html($button['title'])
    );
}

// Usage
<?php render_acf_button(get_field('cta_button'), 'btn btn--primary'); ?>
```

## Common Field Naming Conventions

- `{section}_title` - Section heading
- `{section}_subtitle` - Section subheading
- `{section}_content` - Main content
- `{section}_image` - Primary image
- `{section}_background` - Background image
- `{section}_button` - Call-to-action link
- `{section}_items` - Repeater for list items
- `show_{section}` - Toggle section visibility
- `{section}_layout` - Layout variation selector
