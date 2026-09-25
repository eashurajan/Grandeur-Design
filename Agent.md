# Agent Instructions

**Read this `Agent.md` before I prompt you to build anything.**

## Design System for Consistency

Use the design system from:

`D:\Grandeur Design\DS`

- Don’t hard-code any values for **color, typography, spacing, stroke, or radius**.
- Only use the design system to build responsive layouts for **web, tablet, and mobile**.

## Assets

I have created a dedicated folder for assets.

Use assets such as **icons, images, stroke lines, and SVGs** from the assets folder.

Do not create replacement assets when an appropriate asset already exists in the assets folder.

## Stack

Use:

- HTML
- CSS
- JavaScript

## CSS Structure

### General Rules

- Comment the title of every section or element you style so the CSS is easy to understand and edit.
- Keep CSS organized and readable.
- Style the website **section by section**.
- Avoid unnecessary global styles.

### Global Reset

```css
* {
  margin: 0;
  padding: 0;
}
```

### Typography

For all pages, assign typography from the design system to every text element you use:

- `h1`
- `h2`
- `h3`
- `h4`
- `h5`
- `h6`
- `p`
- Other text elements as required

Do not create arbitrary typography values outside the design system.

### Buttons

Use the design system for:

- Primary buttons
- Secondary buttons
- Icon buttons

Do not hard-code button colors, typography, spacing, radius, or other design-system values.

### Section-by-Section Styling

Organize CSS by page sections.

Example:

```css
/* Header */

/* Hero */

/* About */

/* Services */

/* Projects */

/* Testimonials */

/* CTA */

/* Footer */
```

## Naming CSS Classes

Use the **exact Figma layer name** as the CSS class name.

Keep CSS class names consistent with the corresponding Figma layer names so that the implementation is easy to map back to the design.



Note: 
reuse elements, components, and section or Nav if it has to be used across different pages




read agent.md before you implement anything