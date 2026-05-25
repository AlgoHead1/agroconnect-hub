# AgroLinkAfrica — Implementation Summary

## Overview

AgroLinkAfrica is a government-grade farmer registry and agricultural input distribution platform for Zimbabwe. Phase 1 is a fully functional client-side SPA (no backend required) deployed to Vercel.

## Stack

- **Runtime**: React 19, TypeScript 5
- **Router**: TanStack Router (file-based, type-safe)
- **State**: Zustand (persisted auth, in-memory module stores)
- **Forms**: React Hook Form + Zod validation
- **UI**: Radix UI + Tailwind CSS v4 + shadcn/ui components
- **Charts**: Recharts
- **Build**: Vite 7
- **Deployment**: Vercel (static SPA, `vercel.json` rewrite rule)

## Architecture

### Routing
TanStack Router with file-based routing. All protected routes live under `/_authenticated`. Route guards check RBAC via `canAccessRoute` on every navigation in `_authenticated.tsx`.

### RBAC
Three-layer access control:
1. `ROLE_PERMISSIONS` — permission definitions per role (`lib/permissions.ts`)
2. `canAccessRoute` — route-level guard enforced in `_authenticated.tsx`
3. `getFilteredSidebarGroups` — sidebar filtered by module access

### Data
Phase 1 uses deterministic mock data seeded at module load (`lib/mock-data.ts`). Farmer and warehouse stores are Zustand stores. Auth is persisted to `localStorage`.

### Audit
All allocation status changes append to an audit trail stored in the distributions Zustand store. Timeline rendered via `accountability-card.tsx` and `audit-timeline.tsx`.

## Roles

10 roles supported: `super_admin`, `national_admin`, `provincial_admin`, `district_officer`, `ward_officer`, `extension_officer`, `warehouse_manager`, `ngo_partner`, `supplier`, `farmer`.

## Deployment

Deployed as a static SPA on Vercel. `vercel.json` rewrites all paths to `index.html` to support client-side routing. Assets are cache-controlled with long TTLs.

## Phase 2 Scope (not implemented)

- Real backend API (Node/Postgres)
- Live GIS tile integration (Leaflet + choropleth)
- Offline sync (PWA / service worker)
- Push notifications
- Expanded district/ward data for all 60 districts
