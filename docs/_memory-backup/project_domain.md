---
name: Beamix domain
description: beamixai.com is the domain, not beamix.io — transactional email via notify.beamixai.com subdomain
type: project
originSessionId: ffece759-95e5-4e17-a5b7-cf698bc9a9aa
---
Domain: beamixai.com (NOT beamix.io)
Transactional email subdomain: notify.beamixai.com (Resend)
Cold outreach: separate subdomain + separate provider (NOT Resend, NOT notify.*)
Main domain beamixai.com: website only, no direct email sending

**Why:** Protect transactional deliverability from cold email reputation damage. Standard subdomain isolation.
**How to apply:** All Resend `EMAIL_FROM_ADDRESS` configs use notify.beamixai.com. Cold email tools use a different subdomain (e.g., mail.beamixai.com or outreach.beamixai.com).
