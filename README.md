# Weather

Current weather for any city, where the whole screen becomes the sky over that place: its condition (clear, cloudy, fog, rain, snow, storm) and whether it is day or night there.

Live: https://suiryuu-cmd.github.io/weather-app-react.js/

Built with React, TypeScript, Vite, and Tailwind CSS. Weather and city search come from [Open-Meteo](https://open-meteo.com/), which needs no API key.

## Features

- Search for a city, use your current location, or pick a suggested city on the first visit
- Temperature, feels like, humidity, and wind right now
- The next 24 hours and the next 7 days, with a weekly temperature range bar per day
- Two columns on wide screens: current weather on the left, forecast on the right
- °C or °F, remembered in your browser
- Saved and recent places, kept in your browser; your last place opens instantly
- Skies for dawn and dusk, stars on clear nights, falling rain and snow, drifting fog
- Follows your system light or dark theme, respects reduced motion

## Run it

```bash
pnpm install
pnpm dev
```

The dev server opens at `http://localhost:5173/weather-app-react.js/`, the same path as the live site.

Other scripts: `pnpm test` (Vitest), `pnpm lint`, `pnpm build`, `pnpm preview`.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`: lint, test, build, then publish `dist/` to GitHub Pages. The site path is set by `base` in `vite.config.ts`; change it there if the repository is renamed.
