---
name: Weather
description: One screen that is the sky over the chosen place right now.
colors:
  ink-deep: "#0b1a2b"
  ink-deep-soft: "#2e3f52"
  ink-light: "#f1f5fa"
  ink-light-soft: "#cad6e3"
  surface-on-pale: "rgb(255 255 255 / 0.45)"
  surface-on-pale-hover: "rgb(255 255 255 / 0.7)"
  line-on-pale: "rgb(11 26 43 / 0.16)"
  surface-on-dark: "rgb(255 255 255 / 0.08)"
  surface-on-dark-hover: "rgb(255 255 255 / 0.16)"
  line-on-dark: "rgb(255 255 255 / 0.18)"
  idle-top: "#aab9e0"
  idle-mid: "#cad3ee"
  idle-bottom: "#e9ecf7"
  clear-day-top: "#5ab4ef"
  clear-day-mid: "#a6d8f7"
  clear-day-bottom: "#fbe3b6"
  clear-day-glow: "#fff3d6"
  dawn-top: "#8fb0d9"
  dawn-mid: "#e2c6d3"
  dawn-bottom: "#ffd6b3"
  dawn-glow: "#ffe6c9"
  dusk-top: "#1c2147"
  dusk-mid: "#3a2a52"
  dusk-bottom: "#603642"
  dusk-glow: "#6e3c33"
  clear-night-glow: "#394c86"
  cloudy-day-top: "#a9adb2"
  cloudy-day-mid: "#c4c7ca"
  cloudy-day-bottom: "#dcdddf"
  fog-day-top: "#c9c5bd"
  fog-day-mid: "#d3cfc8"
  fog-day-bottom: "#dcd8d1"
  rain-day-top: "#34495d"
  rain-day-mid: "#3b4f62"
  rain-day-bottom: "#3b4d5e"
  snow-day-top: "#cfdced"
  snow-day-mid: "#e6eef7"
  snow-day-bottom: "#fbfdff"
  storm-day-top: "#2a2f3a"
  storm-day-mid: "#353a47"
  storm-day-bottom: "#3d4250"
  clear-night-top: "#0b1330"
  clear-night-mid: "#1b2a55"
  clear-night-bottom: "#34467a"
  cloudy-night-top: "#15191f"
  cloudy-night-mid: "#262c35"
  cloudy-night-bottom: "#3a414c"
  fog-night-top: "#1e2126"
  fog-night-mid: "#33373d"
  fog-night-bottom: "#4a4e54"
  rain-night-top: "#0f1a24"
  rain-night-mid: "#1d2c3a"
  rain-night-bottom: "#2e4152"
  snow-night-top: "#1a2233"
  snow-night-mid: "#2c3850"
  snow-night-bottom: "#3d4a63"
  storm-night-top: "#0b0d12"
  storm-night-mid: "#1a1d26"
  storm-night-bottom: "#2a2e3a"
  dusk-idle-top: "#0e1729"
  dusk-idle-mid: "#18253d"
  dusk-idle-bottom: "#243553"
  dusk-clear-top: "#1b4d86"
  dusk-clear-mid: "#274f7a"
  dusk-clear-bottom: "#574842"
  dusk-cloudy-top: "#3a4452"
  dusk-cloudy-mid: "#434d59"
  dusk-cloudy-bottom: "#454d57"
  dusk-fog-top: "#4a4b4c"
  dusk-fog-mid: "#4d4d4d"
  dusk-fog-bottom: "#4d4d4c"
  dusk-rain-top: "#243746"
  dusk-rain-mid: "#2e4454"
  dusk-rain-bottom: "#36505f"
  dusk-snow-top: "#3a4e62"
  dusk-snow-mid: "#3b4d64"
  dusk-snow-bottom: "#3c4d61"
  dusk-storm-top: "#262b33"
  dusk-storm-mid: "#333a45"
  dusk-storm-bottom: "#3b4350"
typography:
  display:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(5.5rem, 24vw, 9rem)"
    fontWeight: 200
    lineHeight: 0.9
    letterSpacing: "-0.04em"
    fontFeature: "tnum"
  headline:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 200
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    letterSpacing: "-0.025em"
  reading:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 400
    fontFeature: "tnum"
  body:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  label:
    fontFamily: "Geist Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
rounded:
  pill: "9999px"
  panel: "1.5rem"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "32px"
components:
  search-input:
    backgroundColor: "{colors.surface-on-pale}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 16px 0 44px"
  button-control:
    backgroundColor: "{colors.surface-on-pale}"
    textColor: "{colors.ink-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 16px"
  button-control-hover:
    backgroundColor: "{colors.surface-on-pale-hover}"
  chip-place:
    backgroundColor: "{colors.surface-on-pale}"
    textColor: "{colors.ink-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 16px"
  chip-place-current:
    backgroundColor: "{colors.ink-deep}"
    textColor: "var(--sky-mid)"
  button-icon:
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.pill}"
    size: "44px"
  results-panel:
    backgroundColor: "{colors.surface-on-pale}"
    rounded: "{rounded.panel}"
    padding: "12px 20px"
---

# Design System: Weather

## Overview

**Creative North Star: "Looking Up"**

The whole screen is the sky over the chosen place right now. A full-bleed vertical gradient carries condition and time of day; the type carries the numbers. There are no cards, tiles, or weather icons: the sky is the illustration, and everything else sits on one quiet translucent layer above it.

The palette is swapped wholesale by a single attribute (`data-sky` on the root) and all component colors are variables, so no component knows which sky it is on. Light (color-scheme light) shows day skies as daylight; the dark scheme dims day skies to dusk.

**Key Characteristics:**
- Thirteen skies (six conditions x day/night, plus idle), each three stops, top to bottom.
- Two ink families only; each sky is assigned one.
- One translucent surface layer, pill-shaped controls, no shadows.
- Geist Variable throughout; extralight for the big numbers and idle headline.

## Colors

Colors are sky first, ink second; there is no brand accent.

### Primary
- **Sky gradient** (`--sky-top` / `--sky-mid` 55% / `--sky-bottom`): the page background, one triplet per `data-sky` value. Each condition must read without its label: clear saturated blue to warm horizon, cloudy neutral grey, fog flat warm grey, rain low-key blue-grey, snow high-key cold white, storm dark slate. Idle is periwinkle and matches no weather.

### Neutral
- **Deep Ink / Deep Ink Soft**: text, icons, focus ring and selected chip on pale skies (clear/cloudy/fog/snow day, idle).
- **Light Ink / Light Ink Soft**: the same roles on every night sky, rain-day, storm-day, and every sky in the dark scheme.
- **Surface / Surface Hover / Line**: white at 45/70% with 16% ink hairline on pale skies; white at 8/16% with 18% white hairline on dark skies.

### Named Rules
**The One Ink Rule.** Each sky takes exactly one ink family, chosen so both ink and soft ink pass WCAG AA against every stop. A new sky must stay inside the luminance band of its ink, or switch ink.

**The Dusk Twin Rule.** In the dark scheme each day sky dims to dusk but stays lighter and warmer than its night twin, so day and night stay distinguishable.

**The Idle Is Not Weather Rule.** The idle sky never resembles a condition.

## Typography

**Display Font:** Geist Variable (self-hosted via @fontsource-variable/geist; fallback ui-sans-serif, system-ui)

**Character:** One neutral grotesque; hierarchy comes from size and weight extremes, not from a second family.

### Hierarchy
- **Display**: the temperature, the largest thing on screen. Extralight, tight tracking, tabular numerals.
- **Headline**: idle headline only, extralight; 4.5rem from 640px.
- **Title**: place name, medium weight; 1.875rem from 640px. Condition word uses the same size at regular weight.
- **Reading**: the three labelled readings; unit set at body size in soft ink.
- **Body / Label**: body at 1rem (1.125rem lead in idle); labels, chips, section titles at 0.875rem medium; footer at 0.75rem.

### Named Rules
**The Numbers Are Tabular Rule.** Every weather number uses tabular numerals.

**The Light Giant Rule.** Size above 3rem is always extralight (200); weight never grows with size.

## Layout

A single centered column (max 48rem) filling the dynamic viewport height. Padding 16px, 32px from 640px. Vertical order is fixed: search row, results/notice, current weather (vertically centered in remaining space), places, footer. Column gap 32px; control gaps 8px; readings are a three-column grid (max 36rem) under a hairline. Left-aligned throughout.

## Elevation & Depth

Flat. No shadows. Depth is the sky gradient behind a single translucent layer; hover raises surface opacity rather than adding elevation.

### Named Rules
**The One Layer Rule.** Controls and panels sit on one translucent surface; never stack surfaces or add shadows.

## Shapes

Interactive controls (input, buttons, chips, icon buttons) are full pills. The results panel and skeleton blocks are rounded 1.5rem. Borders are a 1px hairline in `line`.

## Components

### Buttons
- **Control** (location): pill, 48px tall, surface fill + hairline, label weight. Hover to surface-hover; press scales to 0.98 (disabled under reduced motion). 150ms.
- **Icon** (save star): 44px circle, no fill at rest, surface on hover, press 0.95. Phosphor star, regular; fill when saved.
- **Text** (Try Again, attribution): underlined, offset 4px / 2px.
- **Focus**: 2px solid ink outline, 2px offset, everywhere.

### Chips
- **Place chip**: pill, 44px, same fill as Control. **Current** place inverts: ink fill, `--sky-mid` text.

### Inputs / Fields
- **Search**: pill, 48px, surface fill with a border in ink at 60% (the one boundary that must reach 3:1 on every sky, WCAG 1.4.11), 20px Phosphor magnifier inset left in soft ink; placeholder in soft ink. Visible label above.

### Cards / Containers
- **Results panel**: rounded 1.5rem, surface + hairline, rows 12px x 20px, row hover to surface-hover.
- **Skeleton**: surface blocks (pill and 1.5rem) pulsing; static under reduced motion.

### Sky crossfade (signature)
Sky stops are registered `@property` colors and glide over 1.2s `cubic-bezier(0.16, 1, 0.3, 1)`. Ink, surface and line do not fade: they flip in one step at 0.15s, when the ease-out sky is about 58% of the way, so text never sits mid-contrast. Instant under `prefers-reduced-motion`. The stale view dims to 60% while loading.

### Sky layer and weather texture
The gradient lives on one fixed, viewport-sized layer (`.sky-fx`, behind the page) so the sky always reads like looking up while the forecast scrolls over it. A radial glow (`--sky-glow`) sits on the horizon for clear day, dawn, dusk and clear night. One pseudo-element carries the texture: tiled stars that fade toward the horizon on clear nights, falling rain streaks (faster for storms), drifting snowflakes in the current ink, and two slow haze bands for fog. Textures move by `transform` only and stop under reduced motion. Dawn and dusk replace clear or cloudy skies within 40 minutes of sunrise or sunset; other conditions keep their own sky.

### Forecast
Below the fold: "Next 24 Hours" as a horizontal, snap-scrolling, keyboard-focusable strip (hour, Phosphor condition icon, temperature; the current hour sits on a surface pill), then "Next 7 Days" as rows of weekday, icon, condition in soft ink, and high and low. Icons are Phosphor regular, one per condition with day and night variants for clear and cloudy. A °C/°F segmented pill sits beside the location button; the pressed option fills with ink.

### Footer
Outside `main` so it is the page's contentinfo landmark: Open-Meteo attribution, and a "Pause Animation" toggle (aria-pressed, remembered) whenever the sky has moving texture (rain, storm, snow, fog).

## Do's and Don'ts

### Do:
- **Do** express any new state through `data-sky` and the existing variables, never per-component colors.
- **Do** keep controls as pills on the single translucent surface.
- **Do** use Phosphor icons at regular weight (paths copied into `src/icons.tsx`, one `<Icon name>` component), 20-24px, for actions (search, location, save) and forecast conditions; nowhere as decoration.
- **Do** keep the ink flip discrete and delayed (0.15s, near the visual midpoint) inside the 1.2s sky glide.

### Don't:
- **Don't** add cards, tiles, shadows, or glass stacks on top of the sky.
- **Don't** add condition icons or illustrations; the sky carries the condition.
- **Don't** fade ink between families or pair a sky with ink that fails AA.
- **Don't** make a dark-scheme day sky darker or cooler than its night twin.
