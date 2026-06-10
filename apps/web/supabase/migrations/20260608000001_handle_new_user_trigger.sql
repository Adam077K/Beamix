-- ============================================================================
-- handle_new_user trigger
-- ----------------------------------------------------------------------------
-- On every new auth.users insert (email/password signup OR OAuth first login),
-- create the matching public.user_profiles + public.subscriptions rows so the
-- app never lands an authenticated user with no profile.
--
-- SECURITY: SECURITY DEFINER + a pinned search_path (defends against
-- search_path hijack), and EXECUTE is revoked from PUBLIC/anon/authenticated —
-- the function is only ever invoked by the trigger, never callable directly.
--
-- IDEMPOTENCY: user_profiles is guarded by its PK (id); subscriptions has NO
-- unique constraint on user_id (PK is a fresh uuid), so a bare ON CONFLICT
-- could never fire — we guard with WHERE NOT EXISTS instead so re-runs / retries
-- never create duplicate subscription rows.
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $func$
begin
  insert into public.user_profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id)
  select new.id
  where not exists (
    select 1 from public.subscriptions where user_id = new.id
  );

  return new;
end;
$func$;

-- The function runs only via the trigger (definer context) — no direct callers.
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
