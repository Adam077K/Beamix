---
name: Beamix domain
description: beamix.tech is the domain, not beamix.io — transactional email via notify.beamix.tech subdomain
type: project
originSessionId: ffece759-95e5-4e17-a5b7-cf698bc9a9aa
---
Domain: beamix.tech (NOT beamix.io)
Transactional email subdomain: notify.beamix.tech (Resend)
Cold outreach: separate subdomain + separate provider (NOT Resend, NOT notify.*)
Main domain beamix.tech: website only, no direct email sending

**Why:** Protect transactional deliverability from cold email reputation damage. Standard subdomain isolation.
**How to apply:** All Resend `EMAIL_FROM_ADDRESS` configs use notify.beamix.tech. Cold email tools use a different subdomain (e.g., mail.beamix.tech or outreach.beamix.tech).
