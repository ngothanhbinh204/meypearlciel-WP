# ACF JSON Export Examples

## Overview

ACF JSON allows you to save field group configurations as JSON files, enabling version control and easy synchronization across environments.

## Setup

1. Create `acf-json` folder in your theme root:
```
wp-content/themes/your-theme/acf-json/
```

2. ACF automatically saves field groups to this folder when you save them in the admin.

## Example: Hero Section Field Group

**File:** `acf-json/group_home_hero.json`

```json
{
    "key": "group_home_hero",
    "title": "Home - Hero Section",
    "fields": [
        {
            "key": "field_hero_title",
            "label": "Hero Title",
            "name": "hero_title",
            "type": "text",
            "instructions": "Main headline for hero section",
            "required": 1,
            "default_value": "",
            "placeholder": "Enter hero title",
            "maxlength": "",
            "wrapper": {
                "width": "",
                "class": "",
                "id": ""
            }
        },
        {
            "key": "field_hero_content",
            "label": "Hero Content",
            "name": "hero_content",
            "type": "wysiwyg",
            "instructions": "Description text for hero section",
            "required": 0,
            "default_value": "",
            "tabs": "all",
            "toolbar": "basic",
            "media_upload": 0,
            "delay": 0
        },
        {
            "key": "field_hero_button",
            "label": "Hero Button",
            "name": "hero_button",
            "type": "link",
            "instructions": "Call-to-action button",
            "required": 0,
            "return_format": "array"
        },
        {
            "key": "field_hero_background",
            "label": "Hero Background Image",
            "name": "hero_background",
            "type": "image",
            "instructions": "Background image for hero section",
            "required": 0,
            "return_format": "array",
            "preview_size": "medium",
            "library": "all",
            "min_width": "",
            "min_height": "",
            "min_size": "",
            "max_width": "",
            "max_height": "",
            "max_size": "",
            "mime_types": "jpg,jpeg,png,webp"
        }
    ],
    "location": [
        [
            {
                "param": "page_template",
                "operator": "==",
                "value": "front-page.php"
            }
        ]
    ],
    "menu_order": 0,
    "position": "normal",
    "style": "seamless",
    "label_placement": "top",
    "instruction_placement": "label",
    "hide_on_screen": "",
    "active": true,
    "description": ""
}
```

## Example: Features Section with Repeater

**File:** `acf-json/group_home_features.json`

```json
{
    "key": "group_home_features",
    "title": "Home - Features Section",
    "fields": [
        {
            "key": "field_features_title",
            "label": "Section Title",
            "name": "features_title",
            "type": "text",
            "instructions": "Main title for features section",
            "required": 1
        },
        {
            "key": "field_features_subtitle",
            "label": "Section Subtitle",
            "name": "features_subtitle",
            "type": "text",
            "instructions": "Subtitle or tagline",
            "required": 0
        },
        {
            "key": "field_features_items",
            "label": "Feature Items",
            "name": "features_items",
            "type": "repeater",
            "instructions": "Add feature items",
            "required": 0,
            "layout": "block",
            "button_label": "Add Feature",
            "min": 0,
            "max": 0,
            "sub_fields": [
                {
                    "key": "field_feature_icon",
                    "label": "Icon",
                    "name": "feature_icon",
                    "type": "image",
                    "instructions": "Feature icon or image",
                    "required": 0,
                    "return_format": "array",
                    "preview_size": "thumbnail",
                    "library": "all"
                },
                {
                    "key": "field_feature_title",
                    "label": "Title",
                    "name": "feature_title",
                    "type": "text",
                    "instructions": "Feature title",
                    "required": 1
                },
                {
                    "key": "field_feature_content",
                    "label": "Content",
                    "name": "feature_content",
                    "type": "wysiwyg",
                    "instructions": "Feature description",
                    "required": 0,
                    "tabs": "all",
                    "toolbar": "basic",
                    "media_upload": 0
                },
                {
                    "key": "field_feature_link",
                    "label": "Link (Optional)",
                    "name": "feature_link",
                    "type": "link",
                    "instructions": "Optional link for this feature",
                    "required": 0,
                    "return_format": "array"
                }
            ]
        }
    ],
    "location": [
        [
            {
                "param": "page_template",
                "operator": "==",
                "value": "front-page.php"
            }
        ]
    ],
    "menu_order": 3,
    "position": "normal",
    "style": "seamless",
    "label_placement": "top"
}
```

## Example: Options Page for Header/Footer

**File:** `acf-json/group_header_settings.json`

```json
{
    "key": "group_header_settings",
    "title": "Header Settings",
    "fields": [
        {
            "key": "field_header_logo",
            "label": "Logo",
            "name": "header_logo",
            "type": "image",
            "instructions": "Upload your logo",
            "required": 1,
            "return_format": "array",
            "preview_size": "medium",
            "library": "all"
        },
        {
            "key": "field_header_phone",
            "label": "Phone Number",
            "name": "header_phone",
            "type": "text",
            "instructions": "Contact phone number displayed in header",
            "required": 0,
            "placeholder": "+84 123 456 789"
        },
        {
            "key": "field_header_email",
            "label": "Email",
            "name": "header_email",
            "type": "email",
            "instructions": "Contact email displayed in header",
            "required": 0,
            "placeholder": "info@example.com"
        },
        {
            "key": "field_header_cta_button",
            "label": "CTA Button",
            "name": "header_cta_button",
            "type": "link",
            "instructions": "Call-to-action button in header",
            "required": 0,
            "return_format": "array"
        }
    ],
    "location": [
        [
            {
                "param": "options_page",
                "operator": "==",
                "value": "theme-settings"
            }
        ]
    ],
    "menu_order": 0,
    "position": "normal",
    "style": "seamless",
    "label_placement": "top"
}
```

## Rendering Examples

### Hero Section

```php
<?php
// template-parts/section/hero.php

$hero_title = get_field('hero_title');
$hero_content = get_field('hero_content');
$hero_button = get_field('hero_button');
$hero_background = get_field('hero_background');

// Get background URL using custom function
$bg_url = $hero_background ? get_image_attrachment($hero_background, 'url') : '';
?>

<section class="hero" <?php if ($bg_url): ?>style="background-image: url('<?php echo esc_url($bg_url); ?>');"<?php endif; ?>>
    <div class="container">
        <?php if ($hero_title): ?>
            <h1 class="hero__title"><?php echo esc_html($hero_title); ?></h1>
        <?php endif; ?>
        
        <?php if ($hero_content): ?>
            <div class="hero__content"><?php echo wp_kses_post($hero_content); ?></div>
        <?php endif; ?>
        
        <?php if ($hero_button): ?>
            <a href="<?php echo esc_url($hero_button['url']); ?>" 
               class="hero__button"
               <?php if ($hero_button['target']): ?>target="<?php echo esc_attr($hero_button['target']); ?>"<?php endif; ?>>
                <?php echo esc_html($hero_button['title']); ?>
            </a>
        <?php endif; ?>
    </div>
</section>
```

### Features Section with Repeater

```php
<?php
// template-parts/section/features.php

$features_title = get_field('features_title');
$features_subtitle = get_field('features_subtitle');
?>

<section class="features">
    <div class="container">
        <?php if ($features_title): ?>
            <h2 class="features__title"><?php echo esc_html($features_title); ?></h2>
        <?php endif; ?>
        
        <?php if ($features_subtitle): ?>
            <p class="features__subtitle"><?php echo esc_html($features_subtitle); ?></p>
        <?php endif; ?>
        
        <?php if (have_rows('features_items')): ?>
            <div class="features__grid">
                <?php while (have_rows('features_items')): the_row(); 
                    $icon = get_sub_field('feature_icon');
                    $title = get_sub_field('feature_title');
                    $content = get_sub_field('feature_content');
                    $link = get_sub_field('feature_link');
                ?>
                    <div class="feature-card">
                        <?php if ($icon): ?>
                            <div class="feature-card__icon">
                                <?php echo get_image_attrachment($icon, 'image'); ?>
                            </div>
                        <?php endif; ?>
                        
                        <?php if ($title): ?>
                            <h3 class="feature-card__title"><?php echo esc_html($title); ?></h3>
                        <?php endif; ?>
                        
                        <?php if ($content): ?>
                            <div class="feature-card__content"><?php echo wp_kses_post($content); ?></div>
                        <?php endif; ?>
                        
                        <?php if ($link): ?>
                            <a href="<?php echo esc_url($link['url']); ?>" 
                               class="feature-card__link"
                               <?php if ($link['target']): ?>target="<?php echo esc_attr($link['target']); ?>"<?php endif; ?>>
                                <?php echo esc_html($link['title']); ?>
                            </a>
                        <?php endif; ?>
                    </div>
                <?php endwhile; ?>
            </div>
        <?php endif; ?>
    </div>
</section>
```

### Header with Options Page Fields

```php
<?php
// header.php

$logo = get_field('header_logo', 'option');
$phone = get_field('header_phone', 'option');
$email = get_field('header_email', 'option');
$cta_button = get_field('header_cta_button', 'option');
?>

<header class="header">
    <div class="container">
        <?php if ($logo): ?>
            <a href="<?php echo esc_url(home_url('/')); ?>" class="header__logo">
                <img src="<?php echo esc_url($logo['url']); ?>" 
                 ?php echo get_image_attrachment($logo, 'image'); ?
        <?php endif; ?>
        
        <nav class="header__nav">
            <?php wp_nav_menu(array('theme_location' => 'primary')); ?>
        </nav>
        
        <div class="header__contact">
            <?php if ($phone): ?>
                <a href="tel:<?php echo esc_attr(str_replace(' ', '', $phone)); ?>" class="header__phone">
                    <?php echo esc_html($phone); ?>
                </a>
            <?php endif; ?>
            
            <?php if ($email): ?>
                <a href="mailto:<?php echo esc_attr($email); ?>" class="header__email">
                    <?php echo esc_html($email); ?>
                </a>
            <?php endif; ?>
            
            <?php if ($cta_button): ?>
                <a href="<?php echo esc_url($cta_button['url']); ?>" 
                   class="header__cta-button"
                   <?php if ($cta_button['target']): ?>target="<?php echo esc_attr($cta_button['target']); ?>"<?php endif; ?>>
                    <?php echo esc_html($cta_button['title']); ?>
                </a>
            <?php endif; ?>
        </div>
    </div>
</header>
```

## Tips

1. **Unique Keys:** ACF automatically generates unique keys. Don't modify them manually.

2. **Location Rules:** Be specific with location rules to avoid field groups appearing on wrong pages.

3. **Field Groups per Page:** For a typical landing page with 6-8 sections, create 6-8 separate field groups.

4. **Menu Order:** Use `menu_order` to control the sequence of ACF meta boxes on the edit screen.

5. **Style Options:**
   - `seamless`: No meta box border (recommended for page builders)
   - `default`: Standard meta box with border

6. **Sync Across Environments:** 
   - Commit `acf-json/` folder to Git
   - ACF will detect differences and allow sync in admin

7. **Field Group Naming:**
   - Pattern: `{Page} - {Section}` 
   - Example: "Home - Hero Section", "About - Team Section"
