# Theme Guide

This file is the source of truth for the RiotGym visual theme.
Every UI change in `mobile/` and `frontend-web/` should follow this guide.

## Font

Primary display font:

```text
The Year of the Camel
```

Font files are stored in:

```text
The Year of The Camel/
```

Use this font for the main brand, large headings, important numbers, and editorial-style labels.
If the font is not installed yet in the app, keep the layout ready for it and use the closest bundled fallback temporarily.

Recommended fallback stack:

```css
font-family: "The Year of the Camel", Georgia, "Times New Roman", serif;
```

## Main Colors

CSS tokens:

```css
:root {
  --background: #ffffff;
  --text: #151515;
  --accent: #e93565;
  --line: #d9d9d9;
  --gray: #8c8c8c;
  --card: rgba(255, 255, 255, 0.72);
}
```

React Native tokens:

```ts
export const themeColors = {
  background: "#ffffff",
  text: "#151515",
  accent: "#e93565",
  line: "#d9d9d9",
  gray: "#8c8c8c",
  card: "rgba(255, 255, 255, 0.72)"
};
```

## Brand Dot Color

Use this color for the brand dot, active state, primary highlights, selected tabs, important progress indicators, and primary action accents.

```css
#e93565
```

## Style Direction

- White editorial portfolio.
- Large serif-style typography.
- Black primary text.
- Pink/fuchsia accent.
- Light gray borders.
- Soft white cards.
- 8px border radius.
- Minimal dashboard charts.

## Layout Rules

- Keep the interface bright, white, and editorial.
- Use black text for primary reading and data.
- Use the accent color sparingly for meaning, not decoration.
- Use light borders instead of heavy shadows.
- Cards should feel soft and quiet, with `rgba(255, 255, 255, 0.72)`.
- Default card radius is `8px`.
- Charts should be minimal, thin, and easy to scan.
- Avoid dark dashboards, beige palettes, green-heavy fitness themes, and loud gradients.

## Component Guidance

- Primary buttons: black or white surface with `#e93565` used for the active cue.
- Inputs: white background, light gray border, black text, 8px radius.
- Tabs: active tab uses `#e93565`; inactive tab uses `#8c8c8c`.
- Cards: white translucent surface, light gray border, 8px radius.
- Metrics: large serif numbers, small gray labels.
- Dividers and chart grid lines: `#d9d9d9`.

## Implementation Notes

- Mobile theme values live in `mobile/src/theme.ts`.
- Web theme values should be defined as CSS variables.
- New UI work should use tokens from this document instead of hard-coded colors.
- If a color is missing, add it here first before using it in the app.
