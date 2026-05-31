# Stitch Light Mode UI Spec

Source: https://stitch.withgoogle.com/

Scope: Light mode app shell for the Stitch AI design workspace.

## Brand Direction

Stitch is an AI-native design canvas. Light mode should feel clean, calm, spacious, rounded, and tool-like: a dotted workspace background, soft green-gray panels, pill controls, Google Sans typography, and restrained Custom palette accents for AI emphasis.

Avoid marketing-page composition. Prioritize an editable workspace, project context, prompt creation, and lightweight controls.

## Custom Palette Source

The color system is mixed with the provided Custom swatch:

- Green: primary brand and positive creation energy.
- Blue: secondary actions, links, info, and focus fallback.
- Yellow: accent highlights and small moments of emphasis.
- Green-gray: neutral surfaces, panels, borders, and disabled states.

Green is intentionally darkened for text, links, focus, and filled buttons so contrast remains accessible on light backgrounds. Yellow is not used as the warning token because it is now part of the brand accent palette.

## Design Tokens

```css
:root {
  /* Brand */
  --color-brand-green: #2ecb70;
  --color-brand-blue: #25a8e0;
  --color-brand-yellow: #f4c400;

  --color-primary-subtle: #e9f8f0;
  --color-primary-tint: #8ee7b5;
  --color-primary: #188c55;
  --color-primary-hover: #0f7546;
  --color-primary-active: #0b613a;

  --color-secondary-subtle: #e7f5fb;
  --color-secondary: #1a73a8;
  --color-secondary-hover: #155d89;

  --color-accent-subtle: #fff7cc;
  --color-accent: #d6a900;
  --color-accent-strong: #9c7a00;

  /* Surfaces */
  --color-surface: #f7f8f6;
  --color-surface-grid: #f5f7f4;
  --color-surface-panel: #e1e5e1;
  --color-surface-raised: #edf1ed;
  --color-surface-control: #f0f3ef;
  --color-surface-control-hover: #e6ebe6;
  --color-surface-active: #ffffff;

  /* Borders */
  --color-border: #c6cec7;
  --color-border-soft: #d8ded8;

  /* Text */
  --color-text: #202421;
  --color-text-secondary: #5f6861;
  --color-text-muted: #8b948d;
  --color-text-inverse: #ffffff;

  /* Status */
  --color-error: #c5221f;
  --color-warning: #b06000;
  --color-success: #188c55;
  --color-info: #1a73a8;

  /* Functional */
  --color-focus: #188c55;
  --color-focus-fallback: #1a73a8;
  --color-selection: #d8f3e4;
  --color-overlay: rgba(32, 36, 33, 0.52);
  --color-skeleton: #d8ded8;

  /* Typography */
  --font-sans: "Google Sans", "Inter", system-ui, sans-serif;
  --font-display: "Google Sans Display", "Google Sans", system-ui, sans-serif;

  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.25rem;
  --text-h3: 1.938rem;
  --text-h2: 2.438rem;
  --text-h1: 5.25rem;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;

  /* Shape */
  --radius-pill: 9999px;
  --radius-button: 9999px;
  --radius-control: 24px;
  --radius-panel: 28px;
  --radius-sidebar: 20px;
  --radius-thumbnail: 10px;

  /* Elevation */
  --shadow-subtle: 0 1px 2px rgba(32, 36, 33, 0.12);
  --shadow-card: 0 2px 6px rgba(32, 36, 33, 0.16);
  --shadow-floating: 0 4px 12px rgba(32, 36, 33, 0.18);
}
```

## Layout

```txt
App Shell
  Background
    Full viewport
    Light dotted grid
    No decorative gradient or heavy texture

  Header
    Height: 72px
    Left: Stitch logo + BETA pill
    Right: Docs, tool icons, more menu, avatar

  Sidebar
    Width: about 520px on desktop
    Background: --color-surface-panel
    Border: 1px solid --color-border
    Radius: --radius-sidebar
    Content:
      Project scope tabs
      Search projects field
      Recent projects
      Example projects

  Main Canvas
    Offset after sidebar
    Centered content column
    Content:
      Announcement pill
      H1: Welcome to Stitch.
      Prompt composer
      Suggestion chips
      Inspiration carousel
```

## Components

### Header

- Keep the header visually light and tool-focused.
- Icon buttons are 40px circular targets.
- Rest state is transparent.
- Hover state uses `--color-surface-control-hover`.
- Icon-only buttons require accessible names and tooltips.

### Sidebar

- Sidebar is a workspace navigator, not a content card.
- Use `--color-surface-panel` to distinguish it from the dotted canvas.
- Keep section labels short and secondary.
- Project rows should be dense enough for scanning but not cramped.

### Project Scope Tabs

- Use a segmented pill.
- Active tab uses `--color-surface-active` and `--shadow-subtle`.
- Inactive tab uses transparent background and `--color-text-secondary`.
- Both tabs keep the same height and radius.

### Search Field

- Background: slightly darker than the sidebar surface.
- Radius: `--radius-pill`.
- Left search icon.
- Placeholder: `--color-text-muted`.
- Focus: visible 2px ring using `--color-focus`.

### Project Rows

- Thumbnail: 58px to 64px square.
- Thumbnail radius: `--radius-thumbnail`.
- Title: 16px, 600 weight, `--color-text`.
- Metadata: 14px, `--color-text-secondary`.
- Row spacing: 20px to 24px.

### Announcement Pill

- Centered above the main heading.
- Background: `--color-surface-control`.
- Border: `1px solid --color-border`.
- Radius: `--radius-control`.
- Link or emphasized text uses `--color-primary`.
- Small highlight details may use `--color-accent` on subtle backgrounds, but yellow should not be used for long text.
- Include a close icon with a 32px to 40px hit area.

### Main Heading

- Text: `Welcome to Stitch.`
- Font: `--font-display`.
- Size: `--text-h1` on desktop.
- Weight: 400.
- Color: `--color-text`.
- Keep letter spacing normal.

### Primary Action

Primary action: `Start with your design`.

- Use one primary action per view.
- Pill button with icon plus label.
- Background: `--color-surface-control`.
- Text: `--color-text`.
- Border: `1px solid --color-border`.
- Hover: `--color-surface-control-hover`.
- Focus: 2px ring using `--color-focus`.

### Prompt Composer

The prompt composer is the main interaction surface.

- Background: `--color-surface-raised`.
- Border: `1px solid --color-border`.
- Radius: `--radius-panel`.
- Min height: about 320px.
- Placeholder: large text using `--color-text-secondary`.
- Bottom toolbar is pinned inside the composer.

Toolbar:
- Left: add button and App/Web segmented control.
- Right: style icon, model selector, mic button, submit arrow.
- Submit arrow is disabled until the prompt has valid content.

### App/Web Segmented Control

- Container uses a soft gray pill.
- Active item uses white background and `--shadow-subtle`.
- Inactive item uses transparent background and secondary text.
- Use icons before text labels.

### Model Selector

- Pill button.
- Background: `--color-surface-control`.
- Text: `--color-text`.
- Icon plus model name plus chevron.
- Active AI/model emphasis can use `--color-primary-subtle` with `--color-primary`.
- Preserve width while loading or switching models.

### Suggestion Chips

- Pill buttons.
- Background: `--color-surface-control`.
- Border: `1px solid --color-border-soft`.
- Text: `--color-text`.
- Single line with ellipsis truncation.
- Hover: darker surface and subtle shadow.

### Inspiration Carousel

- Heading: `Need inspiration?`
- Cards should preview real designs or templates.
- Navigation arrows should be icon buttons with accessible names.
- Do not put carousel cards inside another card container.

## States

Buttons:
- Rest: neutral surface or transparent.
- Hover: surface darkens slightly.
- Active: slight pressed visual.
- Focus: visible primary focus ring.
- Disabled: muted text, no shadow, no pointer action.
- Loading: preserve button width and show spinner or progress affordance.

Errors:
- Use `--color-error` only for errors.
- Prefer inline errors next to the affected field.
- Provide recovery action when possible.

Warnings:
- Use `--color-warning` only for warnings.
- Do not use `--color-brand-yellow` as a warning color; reserve it for brand accents.

Success:
- Use `--color-success` only for completed or confirmed states.

## Accessibility

- Text on light surfaces must meet WCAG 2.2 AA contrast.
- Use `--color-text-secondary` or darker for readable secondary text.
- Use `--color-text-muted` only for placeholders, disabled text, and low-priority hints.
- Use `--color-primary`, not `--color-brand-green`, for readable green text on light surfaces.
- Use `--color-secondary`, not `--color-brand-blue`, for readable blue text on light surfaces.
- Use `--color-accent-strong` for yellow text if text is required; prefer yellow as a background tint or icon accent.
- Body text must be at least 16px.
- Compact labels and metadata may use 14px.
- Icon-only buttons need `aria-label`.
- All interactive controls need keyboard focus states.
- The prompt composer should be implemented as a real `textarea` or a proper `role="textbox"` with keyboard support.
- Touch targets should be at least 44px where possible.

## Interaction Rules

- Keep the canvas calm and uncluttered.
- Use green for primary active states, blue for secondary/info, and yellow only for small accents.
- Avoid multiple primary CTAs in the same view.
- Prefer icons for toolbar tools, with tooltips for unfamiliar actions.
- Do not place cards inside cards.
- Avoid inner scroll regions unless the app surface requires them.
- Preserve stable dimensions for composer controls, sidebar rows, chips, and toolbar buttons.
- Use `cursor: pointer` on all clickable controls.
