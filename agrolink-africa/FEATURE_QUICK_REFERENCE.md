# AgroLinkAfrica — Feature Quick Reference

Phase 1 pilot. All data is session-scoped (in-memory). No backend required for demo.

## Authentication

Demo login at `/login`. All accounts use password `demo`.

| Email | Role |
|---|---|
| admin@agrolink.zw | Super Admin |
| national@agrolink.zw | National Admin |
| province@agrolink.zw | Provincial Admin |
| district@agrolink.zw | District Officer |
| ward@agrolink.zw | Ward Officer |
| extension@agrolink.zw | Extension Officer |
| warehouse@agrolink.zw | Warehouse Manager |
| ngo@agrolink.zw | NGO Partner |
| supplier@agrolink.zw | Supplier |
| farmer@agrolink.zw | Farmer |

## Modules

**Farmer Registry** `/farmers`
- View all registered farmers with search and filter
- Register new farmer (`/farmers/new`) — full form with duplicate detection
- View farmer profile with QR code, allocations, and audit trail

**Households** `/households`
- Household registry linked to villages and wards

**Distributions** `/distributions`
- Allocation creation, approval, and collection workflow
- QR-based collection verification
- Audit timeline per allocation

**Warehouses** `/warehouses`
- Inventory tracking with stock-on-hand and reorder alerts

**Geographic Coverage** `/gis`
- Province, district, and ward coverage summaries
- Farmer counts, allocation totals, vulnerability breakdowns

**Reports** `/reports`
- Province and district performance tables
- Farm coverage by hectares and distribution counts

**User Management** `/users`
- Admin-only user roster (Super Admin / National Admin)

**Settings** `/settings`
- System and account configuration

## RBAC

Route access is enforced server-side via `canAccessRoute`. Sidebar links are filtered per role via `getFilteredSidebarGroups`. Farmers and lower-privilege roles cannot access admin routes even with direct URL entry.

## Onboarding

Farmers see an onboarding flow on first login. Other roles go directly to their role-specific dashboard.
