-- ============================================================================
-- handle_new_user trigger
-- ----------------------------------------------------------------------------
-- On every new auth.users insert (email/password signup OR OAuth first login),
-- create the matching public.user_profiles + public.subscriptions rows so the
-- app never lands an authenticated user with no profile.
--
-- SECURITY: SECURITY DEFINER + a pinned search_path (defends against
-- search_path hijack). ON CONFLICT DO NOTHING keeps it idempotent and safe to
-- re-run / safe if a row was created by another path.
--
-- Columns populated explicitly (all others rely on table defaults):
--   user_profiles: id (= auth uid), email, full_name (from signup metadata)
--   subscriptions: user_id (= auth uid); status defaults to 'trialing'
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
  values (new.id)
  on conflict do nothing;

  return new;
end;
$func$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
