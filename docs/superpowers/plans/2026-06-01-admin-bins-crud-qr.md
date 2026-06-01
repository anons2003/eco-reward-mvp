# Admin Bins CRUD + QR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build real Supabase-backed admin CRUD for trash bins and show/download a QR code for each bin.

**Architecture:** Keep `public.bins` as the source of truth. Admin pages read bins from Supabase; admin mutations go through `/api/admin/bins` and `/api/admin/bins/[id]` using the service-role admin client after `requireAdmin()`. QR output encodes the bin `qr_code` string so the existing scan flow can create scan sessions from that value.

**Tech Stack:** Next.js App Router, Supabase SSR/admin clients, Vitest, Tailwind CSS, lucide-react, external QR image endpoint for QR rendering.

---

### Task 1: Admin Bin API

**Files:**
- Create: `src/app/api/admin/bins/bin-schema.ts`
- Create: `src/app/api/admin/bins/route.ts`
- Create: `src/app/api/admin/bins/[id]/route.ts`
- Create: `src/app/api/admin/bins/route.test.ts`
- Create: `src/app/api/admin/bins/[id]/route.test.ts`

- [ ] Write failing tests for list/create/update/deactivate.
- [ ] Run targeted tests and verify they fail because routes are missing or demo-only.
- [ ] Implement zod validation, `requireAdmin()`, service-role CRUD, and audit log inserts.
- [ ] Run targeted tests and verify they pass.

### Task 2: Admin Bin UI

**Files:**
- Modify: `src/app/admin/bins/page.tsx`
- Modify: `src/app/admin/bins/[id]/page.tsx`
- Create: `src/components/admin/bin-management-actions.tsx`

- [ ] Replace demo store data with Supabase `bins` queries.
- [ ] Add create/edit/deactivate modal actions.
- [ ] Show QR preview and download link using `qr_code`.
- [ ] Keep desktop table and mobile cards readable.

### Task 3: Verification

**Files:**
- No production files unless a bug is found.

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Browser test `/admin/bins`: create bin, edit bin, view detail QR, deactivate bin.
- [ ] Capture desktop/mobile screenshots and check console errors.
