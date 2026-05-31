# User Avatar S3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real user avatars from Google OAuth metadata and custom uploads stored in AWS S3, then expose the required S3 env vars on Vercel.

**Architecture:** Store the canonical avatar URL and optional S3 object key on `public.profiles`. On login/profile render, prefer `profiles.avatar_url`, fall back to Google metadata `avatar_url`/`picture`, then initials. Uploads go through a server route that validates auth, file type, and size before writing to S3 and updating the profile row.

**Tech Stack:** Next.js App Router, Supabase SSR/Auth/Postgres, AWS SDK S3 client, Vercel environment variables, existing Tailwind/lucide UI.

---

## File Structure

- Modify `db/migrations/0001_eco_reward_mvp.sql`: include avatar columns and hydrate Google avatar in `private.handle_new_user()`.
- Create `db/migrations/0002_profile_avatars.sql`: production-safe migration for existing DBs.
- Modify `src/infrastructure/supabase/database.types.ts`: add `avatar_url` and `avatar_object_key`.
- Create `src/infrastructure/storage/s3.ts`: server-only S3 client, env parsing, object URL builder.
- Create `src/components/shared/user-avatar.tsx`: reusable avatar renderer with image fallback and initials.
- Create `src/components/user/avatar-upload-form.tsx`: settings upload UI.
- Create `src/app/api/profile/avatar/route.ts`: authenticated upload endpoint.
- Modify `src/components/user/user-app-shell.tsx`: use real avatar prop.
- Modify `src/app/(user)/layout.tsx`: fetch avatar fields and pass to shell.
- Modify `src/app/(user)/profile/page.tsx`: show real avatar and fallback Google metadata.
- Modify `src/app/(user)/settings/page.tsx`: show real avatar and upload form.
- Modify `src/components/shared/app-toast.tsx`: add avatar upload success/error toast messages.
- Update Vercel env vars:
  - `AWS_REGION=ap-southeast-1`
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `S3_AVATAR_BUCKET`
  - optional `S3_AVATAR_PUBLIC_BASE_URL`

## Task 1: Schema And Types

**Files:**
- Modify: `db/migrations/0001_eco_reward_mvp.sql`
- Create: `db/migrations/0002_profile_avatars.sql`
- Modify: `src/infrastructure/supabase/database.types.ts`

- [ ] Add `avatar_url text` and `avatar_object_key text` to `profiles`.
- [ ] Update `private.handle_new_user()` to insert `avatar_url` from `raw_user_meta_data ->> 'avatar_url'` or `raw_user_meta_data ->> 'picture'`.
- [ ] Add a production migration:

```sql
alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists avatar_object_key text;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'),
    'user'
  )
  on conflict (id) do update set
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);

  return new;
end;
$$;
```

- [ ] Apply the migration to Supabase project `lhoaxabweqpuyqqcubiz` using the Supabase plugin.
- [ ] Verify with `select column_name from information_schema.columns where table_schema='public' and table_name='profiles' and column_name like 'avatar%';`.

## Task 2: S3 Upload Infrastructure

**Files:**
- Create: `src/infrastructure/storage/s3.ts`
- Modify: `package.json`, `package-lock.json`

- [ ] Keep `@aws-sdk/client-s3` dependency already installed.
- [ ] Implement `getAvatarStorageConfig()` requiring bucket, region, access key, and secret key.
- [ ] Implement `putAvatarObject({ key, body, contentType })` using `PutObjectCommand`.
- [ ] Implement `avatarPublicUrl(key)` using `S3_AVATAR_PUBLIC_BASE_URL` when present, otherwise `https://${bucket}.s3.${region}.amazonaws.com/${key}`.

## Task 3: Avatar Upload API

**Files:**
- Create: `src/app/api/profile/avatar/route.ts`
- Test: `src/app/api/profile/avatar/route.test.ts`

- [ ] Add a failing test for unauthenticated upload returning redirect `/login`.
- [ ] Add a failing test for invalid file type redirecting `/settings?avatar=invalid_type`.
- [ ] Add a failing test for successful upload calling S3 and updating `profiles.avatar_url/avatar_object_key`.
- [ ] Implement `POST /api/profile/avatar`:
  - require `supabase.auth.getUser()`
  - accept form field `avatar`
  - allow only `image/jpeg`, `image/png`, `image/webp`
  - max size 2 MB
  - key format `avatars/{user.id}/{crypto.randomUUID()}.{ext}`
  - update profile by `id`
  - redirect `/settings?avatar=success`

## Task 4: Shared Avatar UI

**Files:**
- Create: `src/components/shared/user-avatar.tsx`
- Modify: `src/components/user/user-app-shell.tsx`
- Modify: `src/app/(user)/layout.tsx`
- Modify: `src/app/(user)/profile/page.tsx`
- Modify: `src/app/(user)/settings/page.tsx`
- Create: `src/components/user/avatar-upload-form.tsx`

- [ ] Create `UserAvatar` with `src`, `name`, `size`, optional `className`.
- [ ] Use real avatar in desktop/mobile shell instead of hard-coded image.
- [ ] Use `profiles.avatar_url ?? user.user_metadata.avatar_url ?? user.user_metadata.picture`.
- [ ] Add upload form in settings profile card with file input and submit button.
- [ ] Keep UI consistent with current EcoReward rounded green design.

## Task 5: Toasts And Vercel Env

**Files:**
- Modify: `src/components/shared/app-toast.tsx`

- [ ] Add settings avatar toast mappings:
  - `avatar=success`: `Ảnh đại diện đã được cập nhật.`
  - `avatar=missing_file`: `Vui lòng chọn ảnh đại diện.`
  - `avatar=invalid_type`: `Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.`
  - `avatar=file_too_large`: `Ảnh đại diện tối đa 2 MB.`
  - `avatar=upload_failed`: `Chưa thể tải ảnh đại diện lên S3. Vui lòng thử lại.`
- [ ] Set Vercel env vars for production/preview/development with `npx vercel env add`.
- [ ] Redeploy production and re-alias `eco-cycle-mvp.vercel.app`.

## Task 6: Verification

**Commands:**

```bash
npm run lint
npm test
npm run build
```

- [ ] Verify profile/settings render with Google avatar fallback.
- [ ] Verify upload rejects non-images and >2 MB.
- [ ] Verify successful upload updates `profiles.avatar_url`.
- [ ] Verify production route responds after deploy.
- [ ] Commit and push.

## Self-Review

- Spec coverage: covers Google avatar, manual S3 upload, profile/settings/shell UI, Supabase schema, and Vercel env.
- Placeholder scan: no TBD/TODO placeholders.
- Type consistency: all new fields use `avatar_url` and `avatar_object_key`.
