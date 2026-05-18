---
name: html-to-wordpress-acf
description: 'Convert static HTML to production-ready WordPress theme with ACF (Advanced Custom Fields). Use for: analyzing HTML structure, mapping sections to ACF field groups, generating theme templates, creating section-based architecture with admin tabs. Specialized for Vietnamese WordPress development workflow.'
argument-hint: 'Path to HTML file(s) or UI folder to convert'
---

# HTML to WordPress ACF Theme Converter

Senior WordPress Architect workflow for converting static HTML into production-ready WordPress themes with ACF field groups.

## When to Use

- Converting static HTML templates to WordPress theme
- Setting up ACF section-based architecture
- Creating admin-friendly content management
- Building maintainable, scalable WordPress themes
- Need clear mapping between HTML sections and ACF field groups

## Core Principles

**1 Section = 1 ACF Group = 1 Admin Tab = 1 Template Part**

This is the foundation of maintainable WordPress themes with ACF.

## Workflow Steps

### Step 1: HTML Analysis (CRITICAL - Do This First)

Before writing any code, analyze the HTML structure:

**Layout Components:**
- Header structure (logo, navigation, mobile menu)
- Footer structure (widgets, menus, copyright)
- Identify reusable patterns

**Page Sections:**
- Hero sections
- Content blocks
- Feature grids/lists
- Testimonials
- CTAs (Call-to-Action)
- Contact forms
- Any repeating patterns

**Dynamic vs Static:**
- Which sections need content management?
- Which parts repeat (use Repeater fields)?
- Which parts are one-time content?

**Output Required:**
```
1. Architecture diagram
   - Global Layout (header/footer)
   - Page Templates needed
   - Reusable Components
   
2. Template files list
   - front-page.php (home.html)
   - page-about.php (about.html)
   - archive.php (blog.html)
   - single.php (blog-detail.html)
   - etc.

3. ACF Section mapping
   - Page → Sections → Fields
   - Group names and locations
```

### Step 2: Theme Structure Setup

Create production-standard structure:

```
theme-name/
├── style.css
├── functions.php
├── screenshot.png
├── index.php
├── front-page.php
├── page.php
├── single.php
├── archive.php
├── header.php
├── footer.php
├── acf-json/                    ← ACF JSON auto-sync
├── template-parts/
│   ├── section/                 ← Reusable sections
│   │   ├── hero.php
│   │   ├── features.php
│   │   └── cta.php
│   └── component/               ← Small components
│       ├── button.php
│       └── card.php
├── inc/
│   ├── function-setup.php       ← Enqueue, theme support
│   ├── function-pagination.php
│   ├── function-post-types.php  ← Custom post types
│   ├── function-field.php       ← ACF helpers
│   └── function-custom.php      ← Custom functions
├── UI/                          ← Original HTML files
└── assets/
    └── images/
```

**Key Requirements:**
- NO hardcoded URLs (use `get_template_directory_uri()`)
- Separate logic from templates
- Clear comments in Vietnamese or English
- Explain WHY the structure aids maintenance

### Step 3: Template Mapping

**HTML to WordPress template mapping:**

| HTML File | WordPress Template | When to Use |
|-----------|-------------------|-------------|
| home.html | front-page.php | Static homepage |
| about.html | page-about.php | Specific page by slug |
| contact.html | page-contact.php | Specific page by slug |
| blog.html | archive.php | Blog listing |
| blog-detail.html | single.php | Single post |
| service.html | archive-service.php | Custom post type archive |
| service-detail.html | single-service.php | Custom post type single |

**Template Selection Priority:**
1. `page-{slug}.php` - Specific page by slug
2. Custom Page Template - Reusable template (Template Name header)
3. `page-{id}.php` - Specific page by ID
4. `page.php` - Default page template

### Step 4: Custom Post Types (If Needed)

Analyze HTML to identify content types that need CPT:

**Common CPT Candidates:**
- Projects/Portfolio (`project`)
- Services (`service`)
- Products (`product`)
- Team Members (`team`)
- Testimonials (`testimonial`)
- Jobs/Careers (`job`)
- Case Studies (`case-study`)

**Implementation:**
- Register in `inc/function-post-types.php`
- Create `archive-{posttype}.php`
- Create `single-{posttype}.php`
- Use clear rewrite slugs
- Enable supports: `title`, `editor`, `thumbnail`, `excerpt`
- Enable REST API if needed
- Use `WP_Query` - NEVER `query_posts()`

See: [reference/custom-post-types.md](./references/custom-post-types.md)

### Step 5: ACF Section-Based Architecture (MOST IMPORTANT)

**The Golden Rule: 1 Page = 1 ACF Group (with Tabs for each Section)**

**CRITICAL STRUCTURE RULES:**

1. **1 File = 1 Page** - ONE ACF JSON file per page template (e.g., `group_home_page.json`)
2. **Tab Fields for Sections** - Use ACF Tab fields to organize sections within the single group
3. **Style = Default** - Always use `"style": "default"`, NEVER use `"seamless"`
4. **WYSIWYG for Text** - Use `wysiwyg` field type for ALL paragraphs/descriptions, NOT `textarea`

**Example - Home Page with 8 Sections:**

If your Home Page HTML has 8 sections:
✔ Create 1 ACF field group: `group_home_page.json`
✔ Use 8 Tab fields to separate sections
✔ Create 8 template-parts files for rendering

**Correct ACF Structure:**

```json
{
    "key": "group_home_page",
    "title": "Homepage Content",
    "style": "default",  // ← ALWAYS default, NOT seamless
    "fields": [
        {
            "key": "field_tab_hero",
            "label": "Hero Section",
            "type": "tab",
            "placement": "top"
        },
        {
            "key": "field_hero_title",
            "name": "hero_title",
            "type": "wysiwyg"  // ← WYSIWYG, not textarea
        },
        // ... more hero fields
        {
            "key": "field_tab_about",
            "label": "About Section",
            "type": "tab",
            "placement": "top"
        },
        // ... about fields
    ]
}
```

**OLD (INCORRECT) Structure:**
```
❌ group_home_hero.json
❌ group_home_about.json
❌ group_home_services.json
```

**NEW (CORRECT) Structure:**
```
✅ group_home_page.json (with Tab fields)
```

**ACF Groups Configuration (Deprecated - DO NOT USE):**

```json
Group 1: "Home - Hero"
- Location: Page Template = front-page.php
- Style: Seamless
- Label Placement: Top
- Fields: hero_title, hero_content, hero_button, hero_background

Group 2: "Home - About"
- Location: Page Template = front-page.php
- Fields: about_title, about_content, about_image

... and so on for each section
```

**Field Naming Convention:**
- Prefix with section name: `hero_title`, `features_items`
- Use descriptive names that reflect content purpose
- Group related fields logically

**Field Type Rules:**

| HTML Element | ACF Field Type | Return Format | Notes |
|--------------|----------------|---------------|-------|
| Short text (eyebrow, label) | Text | - | Single line only |
| Paragraph/Description | WYSIWYG | - | **ALWAYS wysiwyg, NEVER textarea** |
| Button/Link | Link | Array | - |
| Image | Image | Array | - |
| Grid/List/Slider | Repeater | - | - |
| Toggle sections | True/False | - | - |
| Select dropdown | Select | - | - |

**CRITICAL: Text Field Selection**
- **Text field** → Single-line inputs (titles without formatting, labels, eyebrows)
- **WYSIWYG field** → ALL multi-line content (descriptions, paragraphs, any text needing formatting)
- **Textarea field** → NEVER use for content (only for SVG code or raw HTML snippets)

**Image Rendering Functions:**

Use custom helper functions for all images (includes lazy loading optimization):

- **ACF Images:** `get_image_attrachment($image, 'image')` - Renders ACF image field with lazy loading
- **Post Thumbnails:** `get_image_post($post_id, 'image')` - Renders post featured image with lazy loading
- **Get URL only:** Pass `'url'` as second parameter for both functions

**IMPORTANT HTML Adjustment:**

When content comes from WYSIWYG fields, change `<p>` tags to `<div>` to prevent content from escaping:

```php
// ❌ WRONG - Content may break out of <p>
<p class="content"><?php echo wp_kses_post($hero_content); ?></p>

// ✔ CORRECT - Use div for WYSIWYG content
<div class="content"><?php echo wp_kses_post($hero_content); ?></div>
```

**Repeater Example:**

```php
// HTML: List of features
<div class="features">
  <div class="feature-item">
    <img src="icon1.svg" alt="Feature 1">
    <h3>Feature Title</h3>
    <p>Feature description</p>
  </div>
  <!-- More items -->
</div> (using custom image function):
<?php if (have_rows('features_items')): ?>
  <div class="features">
    <?php while (have_rows('features_items')): the_row(); 
      $icon = get_sub_field('feature_icon');
      $title = get_sub_field('feature_title');
      $content = get_sub_field('feature_content');
    ?>
      <div class="feature-item">
        <?php if ($icon): ?>
          <?php echo get_image_attrachment($icon, 'image'); ?
      $icon = get_sub_field('feature_icon');
      $title = get_sub_field('feature_title');
      $content = get_sub_field('feature_content');
    ?>
      <div class="feature-item">
        <?php if ($icon): ?>
          <img src="<?php echo esc_url($icon['url']); ?>" 
               alt="<?php echo esc_attr($icon['alt']); ?>">
        <?php endif; ?>
        
        <?php if ($title): ?>
          <h3><?php echo esc_html($title); ?></h3>
        <?php endif; ?>
        
        <?php if ($content): ?>
          <div><?php echo wp_kses_post($content); ?></div>
        <?php endif; ?>
      </div>
    <?php endwhile; ?>
  </div>
<?php endif; ?>
```

See: [references/acf-patterns.md](./references/acf-patterns.md)

### Step 6: Data Validation & Escaping

**ALWAYS check data before output:**

```php
// ✔ CORRECT
if ($hero_title) {
    echo '<h1>' . esc_html($hero_title) . '</h1>';
}

// ❌ WRONG - Missing check
echo '<h1>' . esc_html($hero_title) . '</h1>';
```

**Escaping Functions:**

| Context | Function | Use Case |
|---------|----------|----------|
| Plain text | `esc_html()` | Titles, headings, plain text |
| URL | `esc_url()` | Links, image sources |
| HTML content | `wp_kses_post()` | WYSIWYG content |
| Attribute | `esc_attr()` | HTML attributes |
| JavaScript | `esc_js()` | Inline JS strings |

| ACF Images | `get_image_attrachment()` | ACF image fields (includes escaping) |
| Post Images | `get_image_post()` | Post thumbnails (includes escaping) |
### Step 7: Header & Footer (Options Page)

Header and Footer content should use ACF Options Page, not page-specific fields.

**Create Options Page:**

```php
// inc/function-setup.php
if (function_exists('acf_add_options_page')) {
    acf_add_options_page(array(
        'page_title' => 'Theme Settings',
        'menu_title' => 'Theme Settings',
        'menu_slug'  => 'theme-settings',
        'capability' => 'edit_posts',
        'redirect'   => false
    ));
}
```

**ACF Groups for Global Elements:**
- "Header Settings" → Logo, menu items, top bar content
- "Footer Settings" → Footer menus, copyright, social links
- "Social Media" → Social media URLs
- "Contact Info" → Phone, email, address

### Step 8: Template Parts Organization

Use `get_template_part()` for sections:

```php
// front-page.php
<?php get_header(); ?>

<?php get_template_part('template-parts/section/hero'); ?>
<?php get_template_part('template-parts/section/about'); ?>
<?php get_template_part('template-parts/section/services'); ?>
<?php get_template_part('template-parts/section/features'); ?>
<?php get_template_part('template-parts/section/cta'); ?>

<?php get_footer(); ?>
```

**Benefits:**
- Reusable across pages
- Easier to maintain
- Clear file organization
- Can pass variables with `get_template_part()` args

### Step 9: ACF JSON Output

**Location:** 
```
wp-content/themes/canhcamtheme/acf-json/
```

**Why ACF JSON?**
- Version control friendly
- Auto-sync between environments
- GitHub collaboration
- Easy deployment

**Setup:**

ACF automatically saves field groups to `acf-json/` folder if it exists. Create the folder in your theme root.

**Alternative:** Use `acf_add_local_field_group()` code if JSON is not preferred.

See: [references/acf-json-example.md](./references/acf-json-example.md)

### Step 10: Quality Checklist

Before delivery, verify:

**Structure:**
- [ ] No hardcoded URLs
- [ ] Logic separated from templates (in `inc/` folder)
- [ ] Template parts properly organized
- [ ] Comments are clear and helpful

**ACF:**
- [ ] 1 section = 1 ACF group
- [ ] Field names are descriptive
- [ ] All sections have corresponding template parts
- [ ] Repeaters used for lists/grids
- [ ] Options page for header/footer

**Code Quality:**
- [ ] All output properly escaped
- [ ] Data validation before output
- [ ] No `query_posts()` used
- [ ] Used `WP_Query` correctly
- [ ] No inline CSS
- [ ] Proper WordPress Coding Standards

**SEO & Accessibility:**
- [ ] Semantic HTML5
- [ ] H1 hierarchy correct
- [ ] All images have alt attributes
- [ ] aria-label where needed
- [ ] Basic schema for blog posts

**Performance:**
- [ ] No duplicate code
- [ ] Assets enqueued properly in `inc/function-setup.php`
- [ ] Images optimized
- [ ] No unnecessary queries

## Output Format

When completing a conversion, provide in this order:

1. **Architecture Explanation**
   - Theme structure overview
   - Why this organization aids maintenance
   - Template hierarchy decisions

2. **File List**
   - All files to be created
   - Purpose of each file

3. **Code for Each File**
   - One section per file
   - Complete code (not snippets)
   - Detailed comments

4. **ACF Field Groups**
   - JSON files or PHP code
   - One group per section
   - Field configuration details

5. **Example Implementation**
   - Complete render of 1 section
   - Shows data flow from ACF → template
   - Includes validation and escaping

6. **Admin Guide (Optional)**
   - How content editors use ACF
   - Screenshot suggestions
   - Field usage notes

## Common Pitfalls to Avoid

❌ **Hardcoded URLs**
```php
// Wrong
<img src="http://example.com/wp-content/themes/mytheme/images/logo.png">

// Correct
<img src="<?php echo esc_url(get_template_directory_uri() . '/assets/images/logo.png'); ?>">
```

❌ **Missing Data Validation**
```php
// Wrong
<h1><?php echo esc_html(get_field('title')); ?></h1>

// Correct
<?php 
$title = get_field('title');
if ($title): ?>
    <h1><?php echo esc_html($title); ?></h1>
<?php endif; ?>
```

❌ **Using query_posts()**
```php
// Wrong
query_posts('post_type=product');

// Correct
$products = new WP_Query(array('post_type' => 'product'));
```

❌ **<p> Tags for WYSIWYG Content**
```php
// Wrong - content will escape
<p class="content"><?php echo wp_kses_post($content); ?></p>

// Correct
<div class="content"><?php echo wp_kses_post($content); ?></div>
```

## Additional Resources

- [ACF Field Patterns](./references/acf-patterns.md)
- [ACF JSON Examples](./references/acf-json-example.md)
- [Custom Post Types Guide](./references/custom-post-types.md)
- [Template Organization](./references/template-structure.md)
- [Custom Helper Functions](./references/custom-helper-functions.md) - Image rendering with lazy loading

## Success Criteria

Your WordPress theme is production-ready when:

✔ Admin can manage all content via ACF without touching code
✔ Each section is independent and reusable
✔ Code is clean, documented, and follows WordPress standards
✔ Theme is scalable for future additions
✔ All output is properly validated and escaped
✔ ACF structure mirrors HTML structure logically
