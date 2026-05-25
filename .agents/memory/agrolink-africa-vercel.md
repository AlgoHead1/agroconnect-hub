---
name: AgroLinkAfrica Vercel conversion
description: Key decisions when converting AgroLinkAfrica from TanStack Start/Cloudflare to a static Vite SPA for Vercel deployment
---

Project originally used `@lovable.dev/vite-tanstack-config` which hardwires TanStack Start + `@cloudflare/vite-plugin`. Converting to Vercel required:

1. Replace `vite.config.ts` with standard `vite` + `@tanstack/router-plugin/vite` + `@vitejs/plugin-react` + `@tailwindcss/vite` + `vite-tsconfig-paths` (all already in package.json).
2. Create `index.html` and `src/main.tsx` (SPA entry — TanStack Start used `src/start.ts` + `src/server.ts` instead).
3. Strip `__root.tsx` of SSR-only APIs: `HeadContent`, `Scripts`, `shellComponent`, `appCss?url` import. Replace with plain `<QueryClientProvider><Outlet /></QueryClientProvider>`.
4. Remove from `package.json`: `@lovable.dev/vite-tanstack-config`, `@tanstack/react-start`, `@cloudflare/vite-plugin`.
5. Add `vercel.json` with catch-all rewrite to `index.html`.
6. Strip `declare module '@tanstack/react-start'` block from `routeTree.gen.ts`.

**Why:** `@lovable.dev/vite-tanstack-config` embeds Cloudflare Workers adapter; Vercel needs static SPA output. No backend exists so removing SSR is lossless.

**How to apply:** Key indicator is `import { defineConfig } from "@lovable.dev/vite-tanstack-config"` in vite.config.ts — replace entirely.

Build: `dist/` with `index.html` + hashed assets. Vercel auto-detects Vite and uses `npm run build` + `dist` as output dir. The tsconfig-paths warnings in Replit build logs are from workspace skill templates — harmless, not present on Vercel.
