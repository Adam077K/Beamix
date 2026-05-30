-- Migration: 20260529000007_atomic_consume_deliverable.sql
-- Purpose: Add atomic conditional-increment RPC for deliverable cap enforcement.
--          Closes the read-modify-write race in consumeDeliverable() — two concurrent
--          calls that both read used=cap-1 would both pass and both write, bypassing
--          the paid-usage cap. The RPC collapses check + increment into a single UPDATE
--          inside one database transaction, eliminating the race.
--
-- Rollback: see rollback/20260529000007_atomic_consume_deliverable.rollback.sql
--
-- Notes:
--   - LANGUAGE sql only — no plpgsql DECLARE blocks (memory: feedback_supabase_plpgsql)
--   - SECURITY DEFINER + search_path = '' per project RPC convention
--   - REVOKE from anon + authenticated: only service_role (Inngest / server actions) may call
--   - Returns the new count on success, NULL when over-cap or row missing
--   - Kind is represented as one of the 5 enum text values; CASE guards the column name

-- ─────────────────────────────────────────────────────────────────────────────
-- consume_deliverable
--   Atomically increments one deliverable counter for (customer_id, month_anchor)
--   if and only if the current value is below p_cap.
--
--   Returns: new integer count on success
--            NULL when the row is missing, the kind is unrecognised,
--            or the current count >= p_cap (over-cap)
--
--   Callers must disambiguate NULL by checking whether the row exists:
--     - row exists + NULL → over-cap → raise OverTierCapError
--     - row missing + NULL → subscription not found → raise Error
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.consume_deliverable(
  p_customer_id  uuid,
  p_month_anchor date,
  p_kind         text,
  p_cap          integer
)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.deliverables_per_customer_per_month
     SET schema_pushed_count      = CASE WHEN p_kind = 'schema_pushed'      THEN schema_pushed_count      + 1 ELSE schema_pushed_count      END,
         faq_published_count      = CASE WHEN p_kind = 'faq_published'      THEN faq_published_count      + 1 ELSE faq_published_count      END,
         citation_submitted_count = CASE WHEN p_kind = 'citation_submitted' THEN citation_submitted_count + 1 ELSE citation_submitted_count END,
         content_published_count  = CASE WHEN p_kind = 'content_published'  THEN content_published_count  + 1 ELSE content_published_count  END,
         outreach_email_count     = CASE WHEN p_kind = 'outreach_email'     THEN outreach_email_count     + 1 ELSE outreach_email_count     END
   WHERE customer_id  = p_customer_id
     AND month_anchor = p_month_anchor
     AND p_kind IN ('schema_pushed', 'faq_published', 'citation_submitted', 'content_published', 'outreach_email')
     AND (
       CASE p_kind
         WHEN 'schema_pushed'      THEN schema_pushed_count
         WHEN 'faq_published'      THEN faq_published_count
         WHEN 'citation_submitted' THEN citation_submitted_count
         WHEN 'content_published'  THEN content_published_count
         WHEN 'outreach_email'     THEN outreach_email_count
         ELSE                           p_cap  -- unknown kind → always fails cap check → no update
       END
     ) < p_cap
  RETURNING
    CASE p_kind
      WHEN 'schema_pushed'      THEN schema_pushed_count
      WHEN 'faq_published'      THEN faq_published_count
      WHEN 'citation_submitted' THEN citation_submitted_count
      WHEN 'content_published'  THEN content_published_count
      WHEN 'outreach_email'     THEN outreach_email_count
      ELSE NULL::integer
    END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_deliverable(uuid, date, text, integer) FROM anon, authenticated;
