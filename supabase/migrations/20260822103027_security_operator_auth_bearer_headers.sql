-- Follow-up to operator-auth remediation: preserve the verified Supabase JWT
-- gateway path as well as the separate operator credential for internal calls.

create or replace function public.qa_refinery_distill_invoke(p_file_id text,p_part_index integer)
returns bigint language plpgsql security definer set search_path to 'public','vault','net'
as $function$
declare v_key text; v_op text; v_request_id bigint;
begin
  if not exists(select 1 from public.qa_refinery_distill_parts where file_id=p_file_id and part_index=p_part_index and status in ('queued','failed')) then raise exception 'QA_REFINERY_PART_NOT_QUEUED'; end if;
  select decrypted_secret into v_key from vault.decrypted_secrets where name='qa_runner_publishable_key' limit 1;
  select decrypted_secret into v_op from vault.decrypted_secrets where name='vanhub_operator_token' limit 1;
  if coalesce(v_key,'')='' then raise exception 'QA_RUNNER_KEY_MISSING'; end if;
  if coalesce(v_op,'')='' then raise exception 'VANHUB_OPERATOR_KEY_MISSING'; end if;
  select net.http_post(url:='https://adpphssfoxpyzzonqofz.supabase.co/functions/v1/vanhub-vector-distill',body:=jsonb_build_object('action','process_part','file_id',p_file_id,'part_index',p_part_index),headers:=jsonb_build_object('Content-Type','application/json','apikey',v_key,'Authorization','Bearer '||v_key,'x-vanhub-operator-token',v_op),timeout_milliseconds:=120000) into v_request_id;
  return v_request_id;
end;$function$;

create or replace function public.qa_refinery_adjudicate_invoke(p_domain text)
returns bigint language plpgsql security definer set search_path to 'public','vault','net'
as $function$
declare v_key text; v_op text; v_request_id bigint;
begin
  if not exists(select 1 from public.qa_refinery_distill_parts p cross join lateral jsonb_array_elements(p.distilled->'units') x where p.status='distilled' and x->>'domain'=p_domain) then raise exception 'QA_REFINERY_DOMAIN_NOT_FOUND'; end if;
  select decrypted_secret into v_key from vault.decrypted_secrets where name='qa_runner_publishable_key' limit 1;
  select decrypted_secret into v_op from vault.decrypted_secrets where name='vanhub_operator_token' limit 1;
  if coalesce(v_key,'')='' then raise exception 'QA_RUNNER_KEY_MISSING'; end if;
  if coalesce(v_op,'')='' then raise exception 'VANHUB_OPERATOR_KEY_MISSING'; end if;
  select net.http_post(url:='https://adpphssfoxpyzzonqofz.supabase.co/functions/v1/vanhub-refinery-adjudicate',body:=jsonb_build_object('action','adjudicate_domain','domain',p_domain),headers:=jsonb_build_object('Content-Type','application/json','apikey',v_key,'Authorization','Bearer '||v_key,'x-vanhub-operator-token',v_op),timeout_milliseconds:=120000) into v_request_id;
  return v_request_id;
end;$function$;

create or replace function public.qa_refinery_adjudicate_sync(p_domain text)
returns jsonb language plpgsql security definer set search_path to 'public','vault','extensions'
as $function$
declare v_key text; v_op text; v_resp extensions.http_response;
begin
  if not exists(select 1 from public.qa_refinery_distill_parts p cross join lateral jsonb_array_elements(p.distilled->'units') x where p.status='distilled' and x->>'domain'=p_domain) then raise exception 'QA_REFINERY_DOMAIN_NOT_FOUND'; end if;
  select decrypted_secret into v_key from vault.decrypted_secrets where name='qa_runner_publishable_key' limit 1;
  select decrypted_secret into v_op from vault.decrypted_secrets where name='vanhub_operator_token' limit 1;
  if coalesce(v_key,'')='' then raise exception 'QA_RUNNER_KEY_MISSING'; end if;
  if coalesce(v_op,'')='' then raise exception 'VANHUB_OPERATOR_KEY_MISSING'; end if;
  perform extensions.http_set_curlopt('CURLOPT_CONNECTTIMEOUT_MS','10000'); perform extensions.http_set_curlopt('CURLOPT_TIMEOUT_MS','120000');
  select * into v_resp from extensions.http(('POST'::extensions.http_method,'https://adpphssfoxpyzzonqofz.supabase.co/functions/v1/vanhub-refinery-adjudicate'::varchar,array[extensions.http_header('Content-Type','application/json'),extensions.http_header('apikey',v_key),extensions.http_header('Authorization','Bearer '||v_key),extensions.http_header('x-vanhub-operator-token',v_op)],'application/json'::varchar,jsonb_build_object('action','adjudicate_domain','domain',p_domain)::text)::extensions.http_request);
  return jsonb_build_object('status',v_resp.status,'content',v_resp.content);
end;$function$;

create or replace function public.qa_vector_fallback_invoke(p_file_id text,p_start integer,p_limit integer)
returns bigint language plpgsql security definer set search_path to 'public','vault','net'
as $function$
declare v_key text; v_op text; v_request_id bigint;
begin
  if not exists(select 1 from public.qa_refinery_distill where file_id=p_file_id) then raise exception 'QA_VECTOR_FILE_UNKNOWN'; end if;
  select decrypted_secret into v_key from vault.decrypted_secrets where name='qa_runner_publishable_key' limit 1; select decrypted_secret into v_op from vault.decrypted_secrets where name='vanhub_operator_token' limit 1;
  if coalesce(v_key,'')='' then raise exception 'QA_RUNNER_KEY_MISSING'; end if; if coalesce(v_op,'')='' then raise exception 'VANHUB_OPERATOR_KEY_MISSING'; end if;
  select net.http_post(url:='https://adpphssfoxpyzzonqofz.supabase.co/functions/v1/vanhub-vector-audit-fallback',body:=jsonb_build_object('file_id',p_file_id,'start',greatest(0,p_start),'limit',least(20000,greatest(1,p_limit))),headers:=jsonb_build_object('Content-Type','application/json','apikey',v_key,'Authorization','Bearer '||v_key,'x-vanhub-operator-token',v_op),timeout_milliseconds:=120000) into v_request_id;
  return v_request_id;
end;$function$;

create or replace function public.qa_vector_fallback_invoke_name(p_filename text,p_start integer,p_limit integer)
returns bigint language plpgsql security definer set search_path to 'public','vault','net'
as $function$
declare v_file_id text; v_key text; v_op text; v_request_id bigint;
begin
  select file_id into v_file_id from public.qa_refinery_distill where filename=p_filename limit 1; if coalesce(v_file_id,'')='' then raise exception 'QA_VECTOR_FILE_UNKNOWN'; end if;
  select decrypted_secret into v_key from vault.decrypted_secrets where name='qa_runner_publishable_key' limit 1; select decrypted_secret into v_op from vault.decrypted_secrets where name='vanhub_operator_token' limit 1;
  if coalesce(v_key,'')='' then raise exception 'QA_RUNNER_KEY_MISSING'; end if; if coalesce(v_op,'')='' then raise exception 'VANHUB_OPERATOR_KEY_MISSING'; end if;
  select net.http_post(url:='https://adpphssfoxpyzzonqofz.supabase.co/functions/v1/vanhub-vector-audit-fallback',body:=jsonb_build_object('file_id',v_file_id,'start',greatest(0,p_start),'limit',least(20000,greatest(1,p_limit))),headers:=jsonb_build_object('Content-Type','application/json','apikey',v_key,'Authorization','Bearer '||v_key,'x-vanhub-operator-token',v_op),timeout_milliseconds:=120000) into v_request_id;
  return v_request_id;
end;$function$;
