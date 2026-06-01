create or replace function private.prevent_profile_self_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.is_admin_user(auth.uid())
    or auth.uid() is null
    or coalesce(auth.role(), '') = 'service_role'
    or coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
  then
    return new;
  end if;

  if old.id is distinct from new.id
    or old.email is distinct from new.email
    or old.role is distinct from new.role
    or old.status is distinct from new.status
    or old.points is distinct from new.points
    or old.trust_score is distinct from new.trust_score
    or old.created_at is distinct from new.created_at
  then
    raise exception 'Cannot update admin-managed profile fields';
  end if;

  return new;
end;
$$;

revoke all on function private.prevent_profile_self_privilege_escalation() from public;
