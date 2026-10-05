create or replace function private.validate_affiliation_offer_price()
returns trigger language plpgsql security definer set search_path=''
as $function$
declare v_min numeric;
begin
 select supplier_min_selling_price into v_min from public.products where id=new.product_id and supplier_status='approved';
 if v_min is not null and new.sale_price<v_min then raise exception 'SALE_PRICE_BELOW_MINIMUM'; end if;
 return new;
end;
$function$;
drop trigger if exists affiliations_offer_price_guard on public.affiliations;
create trigger affiliations_offer_price_guard before insert or update of product_id,sale_price on public.affiliations for each row execute function private.validate_affiliation_offer_price();