create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path=''
as $function$
declare v_role text;
begin
  v_role:=case when coalesce(new.raw_user_meta_data->>'role','') in('supplier','customer','seller') then new.raw_user_meta_data->>'role' else 'seller' end;
  insert into public.profiles(id,full_name,nome_completo,country,country_code,country_calling_code,phone_number,phone_e164,whatsapp_number,whatsapp_e164,preferred_language,role,status,pais,telefone)
  values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),coalesce(new.raw_user_meta_data->>'full_name',''),coalesce(new.raw_user_meta_data->>'country_name',''),coalesce(new.raw_user_meta_data->>'country_code',''),coalesce(new.raw_user_meta_data->>'country_calling_code',''),coalesce(new.raw_user_meta_data->>'phone_number',''),coalesce(new.raw_user_meta_data->>'phone_e164',''),coalesce(new.raw_user_meta_data->>'whatsapp_number',''),coalesce(new.raw_user_meta_data->>'whatsapp_e164',''),case when coalesce(new.raw_user_meta_data->>'preferred_language','en')='pt' then 'pt' else 'en' end,v_role,'active',case when upper(coalesce(new.raw_user_meta_data->>'country_code','')) in('ZA','MZ') then upper(new.raw_user_meta_data->>'country_code') else null end,coalesce(new.raw_user_meta_data->>'phone_e164',new.raw_user_meta_data->>'phone_number',''))
  on conflict(id) do update set full_name=excluded.full_name,nome_completo=excluded.nome_completo,country=excluded.country,country_code=excluded.country_code,country_calling_code=excluded.country_calling_code,phone_number=excluded.phone_number,phone_e164=excluded.phone_e164,whatsapp_number=excluded.whatsapp_number,whatsapp_e164=excluded.whatsapp_e164,preferred_language=excluded.preferred_language,role=case when public.profiles.role='admin' then 'admin' else excluded.role end,pais=excluded.pais,telefone=excluded.telefone,updated_at=now();
  if v_role='supplier' then
    insert into public.supplier_profiles(user_id,company_name,responsible_name,country_code,country_name,calling_code,business_phone,whatsapp,business_email,product_categories,description,approval_status)
    values(new.id,coalesce(new.raw_user_meta_data->>'company_name',''),coalesce(new.raw_user_meta_data->>'responsible_name',new.raw_user_meta_data->>'full_name',''),nullif(new.raw_user_meta_data->>'country_code',''),nullif(new.raw_user_meta_data->>'country_name',''),nullif(new.raw_user_meta_data->>'country_calling_code',''),nullif(coalesce(new.raw_user_meta_data->>'phone_e164',new.raw_user_meta_data->>'phone_number',''),''),nullif(coalesce(new.raw_user_meta_data->>'whatsapp_e164',new.raw_user_meta_data->>'whatsapp_number',''),''),nullif(new.email,''),'{}'::text[],nullif(new.raw_user_meta_data->>'description',''),'pending')
    on conflict(user_id) do nothing;
  end if;
  return new;
end; $function$;