import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Production-only CSP: the dev server needs inline scripts for hot reload.
// Only Open-Meteo is reachable; everything else must come from this site.
const csp = [
  "default-src 'self'",
  "connect-src https://api.open-meteo.com https://geocoding-api.open-meteo.com",
  "img-src 'self' data:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ')

const contentSecurityPolicy: Plugin = {
  name: 'content-security-policy',
  apply: 'build',
  transformIndexHtml: () => [{ tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: csp }, injectTo: 'head-prepend' }],
}

// The Latin font is otherwise found only after the CSS has downloaded and parsed.
// Its file name carries a build hash, so the link is added once the bundle exists.
const preloadFont: Plugin = {
  name: 'preload-latin-font',
  apply: 'build',
  transformIndexHtml(_, { bundle }) {
    const font = Object.keys(bundle ?? {}).find((file) => /geist-latin-wght-normal-.*\.woff2$/.test(file))
    if (!font) return []
    return [{ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${font}`, crossorigin: '' }, injectTo: 'head' }]
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), contentSecurityPolicy, preloadFont],
})
