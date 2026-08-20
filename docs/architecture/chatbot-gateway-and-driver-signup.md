# Chatbot gateway and driver signup architecture

This is a standing VanHub chatbot architecture requirement for later implementation after the customer intake engine is release-ready.

## Top-level chatbot uses

The final chatbot should expose four distinct usage routes:

1. Get a quote
2. Post a job
3. Advertise empty space / backload capacity
4. Sign up as a driver

These are separate flows. They may share parsing/retrieval infrastructure, but must not share qualification rules blindly.

### Important distinction: customer load vs driver capacity

A customer saying “van full”, “one Luton”, “not much” or similar is not sufficient inventory/volume evidence for a removal quote.

A driver advertising capacity may legitimately describe available space in vehicle terms, e.g. “half a Luton empty”, because that is capacity information rather than customer inventory.

## Driver signup and Framer CMS dependency

Driver signup must be designed around the existing public driver profile pages, much of whose presentation/detail is currently CMS-bound in Framer.

Therefore driver signup cannot be treated as only a Supabase `driver_accounts` insert without considering CMS publication/synchronisation.

Preferred architecture to evaluate:

- Supabase remains the operational source of truth for authentication, driver account state, featured/subscription status, job claiming, permissions and transactional data.
- Driver profile content needed by existing Framer CMS-bound profile pages must either:
  1. be written/synchronised into Framer CMS automatically after signup, if a supported reliable write path is available, or
  2. have those profile pages migrated away from CMS to Supabase-backed rendering before chatbot signup becomes the canonical signup route.

Do not launch chatbot driver signup until one of those two publication paths is proven end-to-end.

The driver signup flow should collect the profile fields required both operationally and for the public profile page, including any existing CMS-bound fields that must remain visible on the profile.

## Sequencing

Do not widen the current engine56 release work to implement this gateway now. First finish and release-gate the customer intake engine. Then add the four-route gateway as a separate architectural layer with independent tests for each route.
