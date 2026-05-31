# UI Taste Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the reviewed EcoReward UI issues: visual consistency, landing hero quality, admin density, meta-label cleanup, and favicon polish.

**Architecture:** Keep the existing Next.js App Router structure and Tailwind-first styling. Limit changes to shared styling, landing/auth/admin surfaces, and static favicon assets without touching application logic.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, GSAP, lucide-react.

---

### Task 1: Shared Polish

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/auth/auth-shell.tsx`
- Create: `src/app/icon.svg`

- [ ] **Step 1: Add shared brand utility classes**

Add subtle shared background, card, button, and skeleton polish in `globals.css`.

- [ ] **Step 2: Remove weak auth meta-label wording**

Replace the left-panel “Eco Lime Light” label with task-oriented wording that describes the product value.

- [ ] **Step 3: Add a favicon**

Create `src/app/icon.svg` with an EcoReward mark so `/favicon.ico` no longer 404s in Next metadata handling.

### Task 2: Landing Upgrade

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/landing/landing-gsap-animations.tsx`

- [ ] **Step 1: Replace the school-poster split hero**

Use a wide editorial hero with a dark premium product surface, tighter 2-3 line H1, two clear CTAs, and product/impact cards instead of a single childish illustration.

- [ ] **Step 2: Improve section rhythm**

Use denser bento-like step cards and keep the public palette aligned with the vibrant user/auth palette.

- [ ] **Step 3: Strengthen motion**

Add scrubbed text reveal and card stacking/scale behavior while respecting reduced motion.

### Task 3: Admin Upgrade

**Files:**
- Modify: `src/components/shared/eco-ui.tsx`
- Modify: `src/components/shared/top-bar.tsx`
- Modify: `src/app/admin/dashboard/page.tsx`
- Modify: `src/app/admin/submissions/page.tsx`
- Modify: `src/app/admin/bins/page.tsx`
- Modify: `src/app/admin/points/page.tsx`

- [ ] **Step 1: Align admin shared components**

Update shared headers/cards/buttons to use EcoReward vibrant premium tokens with lower radius and clearer operational hierarchy.

- [ ] **Step 2: Make admin dashboard denser**

Add status summary, queue health, recent submissions with stronger table-like rows, and clearer next actions.

- [ ] **Step 3: Improve admin tables/lists**

Make submissions, bins, and points pages more scannable with filters, compact rows, labels, and consistent action surfaces.

### Task 4: Verification

**Files:**
- No new production files expected.

- [ ] **Step 1: Run lint**

Run `npm run lint`; expected: pass.

- [ ] **Step 2: Run production build**

Run `npm run build`; expected: pass.

- [ ] **Step 3: Browser check**

Capture landing/auth/admin screenshots through the existing local dev server and inspect for broken layout, text wrapping, and console errors.
