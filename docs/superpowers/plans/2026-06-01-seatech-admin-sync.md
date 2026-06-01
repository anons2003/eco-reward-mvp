# SeaTech Admin Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the admin dashboard surface into one SeaTech visual, language, navigation, and component system.

**Architecture:** Keep the existing Next.js App Router structure and current Stitch-inspired admin visual direction. Add small reusable admin primitives only where they remove drift, then migrate old admin detail/action UI away from shared `eco-*` components.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4 utility classes, lucide-react, GSAP for lightweight admin reveal motion.

---

### Task 1: Admin Navigation And SeaTech Copy

**Files:**
- Modify: `src/components/admin/admin-shell.tsx`
- Modify: `src/app/admin/dashboard/page.tsx`

- [ ] **Step 1: Normalize admin navigation labels**

Change admin nav labels to Vietnamese SeaTech operation labels:

```tsx
{ href: "/admin/dashboard", label: "Tổng quan", Icon: Home, match: "/admin/dashboard" }
{ href: "/admin/submissions", label: "Lượt gửi", Icon: FileText, match: "/admin/submissions" }
{ href: "/admin/submissions/review", label: "Hàng chờ", Icon: ClipboardList, match: "/admin/submissions/review" }
{ href: "/admin/fraud-alerts", label: "Cảnh báo", Icon: ShieldAlert, match: "/admin/fraud-alerts" }
{ href: "/admin/reports", label: "Báo cáo", Icon: BarChart3, match: "/admin/reports" }
```

- [ ] **Step 2: Add mobile admin overflow access**

Add a fifth mobile item linking to `/admin/settings` with label `Thêm`, so mobile users have a path to secondary admin modules.

- [ ] **Step 3: Remove stale Eco copy**

Replace `Hub: Eco-Central 02` with `Hub: SeaTech Gateway Q1` in `src/app/admin/dashboard/page.tsx`.

- [ ] **Step 4: Verify copy audit**

Run:

```bash
rg -n "Eco-Reward|Eco Reward|EcoReward|Eco-Central" src/app/admin src/components/admin
```

Expected: no output.

### Task 2: Admin Primitives

**Files:**
- Create: `src/components/admin/admin-ui.tsx`

- [ ] **Step 1: Create small admin UI helpers**

Add `AdminPageHeader`, `AdminCard`, `AdminMetric`, and `AdminStatusBadge` with SeaTech admin colors, 16-24px radii, restrained shadows, and Vietnamese status labels.

- [ ] **Step 2: Keep APIs narrow**

Do not replace all admin pages yet. Use the primitives for pages currently depending on `eco-ui` or old shared status UI.

### Task 3: Submission Detail Migration

**Files:**
- Modify: `src/app/admin/submissions/[id]/page.tsx`
- Modify: `src/components/admin/review-actions.tsx`

- [ ] **Step 1: Replace `PageHeader`, `eco-card`, and shared `StatusBadge`**

Use `AdminPageHeader`, `AdminCard`, and `AdminStatusBadge`.

- [ ] **Step 2: Match admin dashboard density**

Use white cards, `#d9e5da` borders, `#fbf9f8` page surface, `#006d37` primary actions, compact labels, and no `eco-card` class.

- [ ] **Step 3: Add admin reveal motion**

Render `AdminDashboardMotion` in the detail page and add `data-admin-reveal` on major panels.

- [ ] **Step 4: Verify old class removal**

Run:

```bash
rg -n "PageHeader|eco-card|StatusBadge|#007a3d" 'src/app/admin/submissions/[id]/page.tsx' src/components/admin/review-actions.tsx
```

Expected: no output.

### Task 4: Verification

**Files:**
- No direct edits.

- [ ] **Step 1: Run lint**

Run:

```bash
npm run lint
```

Expected: exit code 0.

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected: exit code 0.

- [ ] **Step 3: Render check**

Start the dev server and inspect admin routes at desktop and mobile widths. Confirm no clipped nav, stale Eco copy, or old submission detail styling remains.
