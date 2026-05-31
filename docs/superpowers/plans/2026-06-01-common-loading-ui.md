# Common Loading UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one common loading system for page navigation, form submissions, and client-side async actions across EcoReward.

**Architecture:** Keep the existing route-level skeletons for server page transitions, then add a root client provider that listens for internal link clicks and form submissions to show a consistent top progress bar and compact status pill. Add reusable loading primitives for submit buttons and client-side action buttons so individual flows can show inline pending state without duplicating spinner markup.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Tailwind CSS, lucide-react.

---

## Analysis

The app already has `src/app/(user)/loading.tsx`, `src/app/admin/loading.tsx`, and `src/components/shared/page-skeleton.tsx`, so route segment skeletons exist for slow server-rendered pages. The missing common layer is interaction feedback immediately after a user clicks a navigation link, submits a form, or starts a client-side `fetch` action. Current forms and buttons use ad hoc text like `Đang xác nhận...`, while auth/profile forms do not show a button spinner before redirect.

The safest implementation is incremental:

- Root-level provider in `src/app/layout.tsx` so it applies to auth, user, admin, and landing pages.
- Global capture listeners for internal anchor clicks and form submissions. This covers most `Link` and plain `<form action="/api/...">` flows without rewriting every page.
- Reusable `PendingSubmitButton` using `useFormStatus()` for forms that need inline spinner labels.
- Reusable `LoadingSpinner`/`LoadingButtonContent` for client components.
- Hook `useGlobalLoading()` for client async actions that do not trigger native form submit or route navigation.

Out of scope for this pass:

- Replacing every decorative `type="button"` control with real behavior.
- Full redesign of existing skeleton screens.
- New data-loading skeletons per page beyond the existing `PageSkeleton`.

## File Map

- Create `src/components/shared/loading-ui.tsx`
  - Client component file containing `GlobalLoadingProvider`, `useGlobalLoading`, `LoadingSpinner`, `LoadingButtonContent`, and `PendingSubmitButton`.
- Modify `src/app/layout.tsx`
  - Wrap `{children}` and `AppToast` with `GlobalLoadingProvider`.
- Modify `src/components/admin/review-actions.tsx`
  - Use `useGlobalLoading()` and `LoadingButtonContent` for approve/reject async fetch.
- Modify `src/components/user/scan-form.tsx`
  - Use `useGlobalLoading()` and `LoadingButtonContent` for bin verification and continue navigation.
- Modify `src/components/user/capture-flow.tsx`
  - Use `useGlobalLoading()` and `LoadingButtonContent` for AI submission.
- Modify primary submit forms:
  - `src/app/(auth)/login/page.tsx`
  - `src/app/(auth)/register/page.tsx`
  - `src/app/(auth)/forgot-password/page.tsx`
  - `src/app/(auth)/reset-password/page.tsx`
  - `src/app/(auth)/verify-email/page.tsx`
  - `src/app/(auth)/verify-recovery/page.tsx`
  - `src/app/(auth)/admin/login/page.tsx`
  - `src/components/user/avatar-upload-form.tsx`
  - `src/app/(user)/settings/page.tsx`
  - Replace submit button contents with `PendingSubmitButton` where practical.
- Tests:
  - Existing test suite should still pass. Add a focused component unit test only if current setup already supports React component tests; otherwise verify via lint/build and browser behavior.

---

## Tasks

### Task 1: Add Common Loading Primitives

**Files:**
- Create: `src/components/shared/loading-ui.tsx`

- [ ] **Step 1: Create the client loading UI module**

Implement:

- `GlobalLoadingProvider` with document-level `click` and `submit` capture listeners.
- `useGlobalLoading()` for client async flows.
- `LoadingSpinner`, `LoadingButtonContent`, `PendingSubmitButton`.

Key behavior:

- Internal links show `Đang chuyển trang...`.
- Forms show `Đang xử lý...`.
- Provider clears loading on `pathname` or `searchParams` change.
- Provider has a timeout fallback to avoid stuck overlay if a user cancels or validation blocks navigation.
- Respect `prefers-reduced-motion` through existing CSS/Tailwind animation behavior where possible.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: no lint errors from the new client file.

### Task 2: Mount Provider Globally

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Wrap the app**

Import `GlobalLoadingProvider` and wrap the body content:

```tsx
<GlobalLoadingProvider>
  {children}
  <Suspense fallback={null}>
    <AppToast />
  </Suspense>
</GlobalLoadingProvider>
```

- [ ] **Step 2: Verify route compile**

Run: `npm run build`

Expected: Next.js app routes compile, no client/server boundary error.

### Task 3: Convert Core Form Submit Buttons

**Files:**
- Modify auth/profile/settings form files listed in File Map.

- [ ] **Step 1: Import `PendingSubmitButton`**

Use the shared submit button inside native forms where the action redirects to an API route.

- [ ] **Step 2: Preserve existing class names**

Each converted button keeps the same `className`, `type="submit"`, icon, text, and layout. Only pending behavior is added.

- [ ] **Step 3: Check likely flows**

Verify these flows show inline pending state:

- Login email/password
- Google login
- Register
- Forgot password
- Verify email resend
- Verify recovery OTP
- Reset password
- Change password
- Avatar upload

### Task 4: Wire Client Async Actions

**Files:**
- Modify: `src/components/admin/review-actions.tsx`
- Modify: `src/components/user/scan-form.tsx`
- Modify: `src/components/user/capture-flow.tsx`

- [ ] **Step 1: Use `useGlobalLoading()` around async work**

For `try/finally` blocks:

```tsx
setGlobalLoading("Đang xử lý...");
try {
  await work();
} finally {
  clearGlobalLoading();
}
```

- [ ] **Step 2: Use `LoadingButtonContent`**

Replace ad hoc pending text with a shared spinner + text pattern, while preserving existing labels.

- [ ] **Step 3: Preserve disabled behavior**

Existing disabled rules remain unchanged:

- scan verify disables while loading.
- capture submit disables until image captured.
- review buttons disable while loading or no reason.

### Task 5: Verify and Commit

**Files:**
- All modified files from Tasks 1-4.

- [ ] **Step 1: Run checks**

Run:

```bash
npm run lint
npm test
npm run build
```

Expected:

- lint passes.
- tests pass.
- production build passes.

- [ ] **Step 2: Inspect diff**

Run:

```bash
git diff --stat
git status --short
```

Expected:

- Only loading UI and intended form/action files changed.
- Existing untracked `docs/stitch-export/*` remains untracked and unstaged.

- [ ] **Step 3: Commit and push**

Commit:

```bash
git add <changed loading files>
git commit -m "Add common loading UI"
git push github codex/eco-reward-mvp
```

## Self-Review

- Spec coverage: common loading for route navigation, native submit flows, and representative async client actions is covered.
- Placeholder scan: no task relies on TBD behavior; exact files and expected commands are listed.
- Type consistency: exported names are consistent across tasks: `GlobalLoadingProvider`, `useGlobalLoading`, `LoadingSpinner`, `LoadingButtonContent`, `PendingSubmitButton`.
