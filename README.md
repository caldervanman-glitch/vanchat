# VanHub Chatbot Intake Engine

Source-controlled working repository for the VanHub UK chatbot intake engine.

Production `vanhub-chat` is currently v39 and must remain untouched until the isolated replacement passes the full release gate.

The current deployed isolated kernel is `vanhub-chat-kernel` v22 with internal `ENGINE = 55`. Supabase persisted isolated turns currently exist through engine54. The previously referenced engine56 candidate was local-only and has not yet been recovered as a deployed artefact.

This repository will be used as the source of truth for recovered Supabase source, engine changes, refinery-derived tests, adversarial flows, release notes and the final production promotion candidate.
