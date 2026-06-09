-- Rollback for 20260608000001_handle_new_user_trigger.sql
-- Removes the auth.users signup trigger and its function. Does NOT delete any
-- user_profiles / subscriptions rows already created by it.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
