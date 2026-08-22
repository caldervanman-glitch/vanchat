-- Private QA helper: invoke the JWT-protected conversation expectation runner
-- without exposing its stored credential to clients or test transcripts.
create or replace function private.qa_expectation_invoke(p_file text, p_offset integer default 0, p_limit integer default 5)
returns bigint
language plpgsql
security definer
set search_path = public, private, vault, net
as $$
declare
  k text;
  rid bigint;
begin
  select decrypted_secret into k
  from vault.decrypted_secrets
  where name = 'qa_runner_publishable_key'
  limit 1;
  if k is null then
    raise exception 'QA runner credential is not configured';
  end if;

  select net.http_post(
    url := 'https://adpphssfoxpyzzonqofz.supabase.co/functions/v1/vanhub-chat-expectation-runner',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || k
    ),
    body := jsonb_build_object('file', p_file, 'offset', p_offset, 'limit', p_limit),
    timeout_milliseconds := 60000
  ) into rid;
  return rid;
end;
$$;

revoke all on function private.qa_expectation_invoke(text, integer, integer) from public;
revoke all on function private.qa_expectation_invoke(text, integer, integer) from anon;
revoke all on function private.qa_expectation_invoke(text, integer, integer) from authenticated;
