-- Engine56 chatbot-only contact contract.
-- Production v39 already supplies email + phone, so this is backwards-compatible.
-- The general private.create_job_internal contract is intentionally unchanged.

create or replace function public.create_chatbot_job_internal(p_payload jsonb, p_draft_id uuid default null::uuid)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_result jsonb;
  v_job_id uuid;
  v_phone text := nullif(btrim(p_payload ->> 'poster_phone'),'');
  v_email text := nullif(lower(btrim(p_payload ->> 'email')),'');
  v_has_phone boolean := false;
  v_has_email boolean := false;
  v_phone_digits text;
  v_work_payload jsonb := p_payload;
  v_phone_only boolean := false;
  v_text text := lower(concat_ws(' ',
    p_payload ->> 'title', p_payload ->> 'load_summary_public',
    p_payload ->> 'access_notes_public', p_payload ->> 'private_notes'
  ));
  v_explicit_hazard boolean := false;
begin
  v_phone_digits := regexp_replace(coalesce(v_phone,''), '[^0-9]', '', 'g');
  v_has_phone := length(v_phone_digits) >= 7;
  v_has_email := v_email is not null and v_email ~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$';

  if length(btrim(coalesce(p_payload ->> 'poster_name',''))) < 2 then
    raise exception 'Poster name is required' using errcode='22023';
  end if;
  if not v_has_phone and not v_has_email then
    raise exception 'A valid phone number or email address is required' using errcode='22023';
  end if;

  if not v_has_email then
    v_phone_only := true;
    v_work_payload := jsonb_set(v_work_payload,'{email}',to_jsonb('phone-' || v_phone_digits || '@phone.vanhub.invalid'::text),true);
    v_work_payload := v_work_payload - 'email_hash';
  end if;

  v_result := private.create_job_internal(v_work_payload,false,'vanhub_chat_edge_function');
  if (v_result ->> 'job_id') is not null then
    v_job_id := (v_result ->> 'job_id')::uuid;
    if p_draft_id is not null then
      update public.job_drafts set job_id=v_job_id where id=p_draft_id;
    end if;

    if v_phone_only then
      update public.jobs
      set status='awaiting_review', verification_expires_at=null
      where id=v_job_id and status='pending_verification';
      update private.job_owners set poster_email_normalised=null where job_id=v_job_id;
      update private.job_private_details set poster_email=null where job_id=v_job_id;
      v_result := jsonb_set(v_result,'{status}','"awaiting_review"'::jsonb,true);
      v_result := jsonb_set(v_result,'{requires_email_verification}','false'::jsonb,true);
    end if;

    v_explicit_hazard :=
      v_text ~ '(hazardous|asbestos|chemical|gas cylinder|compressed gas|explosive|firearm|weapon|stolen|illegal)'
      or (
        v_text ~ '(fuel|petrol|diesel)[^.!?]{0,40}leak'
        and v_text !~ 'no[[:space:]]+(fuel|petrol|diesel)([[:space:]]+or[[:space:]]+oil)?[[:space:]]+leaks?'
      );

    if lower(coalesce(p_payload ->> 'category',''))='motorbike_transport' and not v_explicit_hazard then
      update private.job_moderation
      set moderation_result='green', rule_hits='[]'::jsonb, updated_at=now()
      where job_id=v_job_id
        and moderation_result='amber'
        and rule_hits='["manual_suitability_review"]'::jsonb;
      if found then
        v_result := jsonb_set(v_result,'{moderation}','"green"'::jsonb,true);
      end if;
    end if;
  end if;
  return v_result || jsonb_build_object('auto_published',false,'phone_only',v_phone_only);
end;
$function$;

revoke all on function public.create_chatbot_job_internal(jsonb,uuid) from public, anon, authenticated;
grant execute on function public.create_chatbot_job_internal(jsonb,uuid) to service_role;
