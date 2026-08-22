-- Follow-up hardening for PR #1 security remediation.
-- SECURITY DEFINER helpers that inject the Vault-held operator token must never
-- be callable by browser/public/authenticated roles. Only service_role (and the
-- database owner/superuser implicitly) may execute them.

revoke all on function private.qa_expectation_invoke(text, integer, integer) from public, anon, authenticated;
grant execute on function private.qa_expectation_invoke(text, integer, integer) to service_role;

revoke all on function public.qa_refinery_distill_invoke(text, integer) from public, anon, authenticated;
grant execute on function public.qa_refinery_distill_invoke(text, integer) to service_role;

revoke all on function public.qa_refinery_adjudicate_invoke(text) from public, anon, authenticated;
grant execute on function public.qa_refinery_adjudicate_invoke(text) to service_role;

revoke all on function public.qa_refinery_adjudicate_sync(text) from public, anon, authenticated;
grant execute on function public.qa_refinery_adjudicate_sync(text) to service_role;

revoke all on function public.qa_vector_fallback_invoke(text, integer, integer) from public, anon, authenticated;
grant execute on function public.qa_vector_fallback_invoke(text, integer, integer) to service_role;

revoke all on function public.qa_vector_fallback_invoke_name(text, integer, integer) from public, anon, authenticated;
grant execute on function public.qa_vector_fallback_invoke_name(text, integer, integer) to service_role;

revoke all on function public.qa_refinery_resume_queue_fire() from public, anon, authenticated;
grant execute on function public.qa_refinery_resume_queue_fire() to service_role;
