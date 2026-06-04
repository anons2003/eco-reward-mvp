# Broad Waste Categories Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate SeaTech MVP waste taxonomy from narrow item keys to broad material groups: plastic, metal, paper, glass, unknown.

**Architecture:** Add new enum values and migrate JSON/rule data forward, while retaining legacy aliases in app code for old rows. AI returns only broad material keys. UI/admin labels show broad Vietnamese category names.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Supabase Postgres migrations.

---

### Task 1: Domain Taxonomy

**Files:**
- Modify: `src/core/entities/types.ts`
- Modify: `src/core/points/point-rules.ts`
- Modify: `src/core/points/calculate-points.ts`

- [ ] Add broad WasteType keys `plastic`, `metal`, `glass` while keeping legacy keys as aliases.
- [ ] Make MVP auto-review use `plastic`, `metal`, `paper`, `glass`.
- [ ] Normalize legacy keys to broad keys before label/point lookup.

### Task 2: AI Output Contract

**Files:**
- Modify: `src/infrastructure/ai/waste-review-schema.ts`
- Modify: `src/infrastructure/ai/openai-provider.ts`
- Modify: `src/application/ai/analyze-image.ts`

- [ ] Change structured output enum to `plastic`, `metal`, `paper`, `glass`, `unknown`.
- [ ] Update Vietnamese household waste prompt rules for broad material groups.
- [ ] Keep guardrails for PET/plastic mistaken as glass.

### Task 3: Supabase Migration

**Files:**
- Create: `db/migrations/0018_broad_waste_material_categories.sql`
- Modify: `src/infrastructure/supabase/database.types.ts`

- [ ] Add enum values `plastic`, `metal`, `glass` if missing.
- [ ] Upsert point rules for broad groups from legacy points.
- [ ] Disable legacy point rules.
- [ ] Rewrite `submissions.ai_result->wasteType` from legacy keys to broad keys.

### Task 4: UI and Tests

**Files:**
- Modify all user/admin label maps and affected tests.

- [ ] Replace visible labels with `Nhựa`, `Kim loại`, `Giấy`, `Thủy tinh`.
- [ ] Update tests for broad category names and AI output.
- [ ] Run targeted tests, lint, and build.

