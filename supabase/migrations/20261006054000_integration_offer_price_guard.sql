create or replace function private.validate_integration_order_item()
returns trigger language plpgsql security definer set search_path=''
as $function$
declare v_min numeric; v_status text;
begin
 select supplier_min_selling_price,supplier_status into v_min,v_status from public.products where id=new.newvelion_product_id;
 if v_status is distinct from 'approved' then raise exception 'PRODUCT_NOT_FOUND'; end if;
 if v_min is not null and new.sale_price<v_min then raise exception 'SALE_PRICE_BELOW_MINIMUM'; end if;
 return new;
end;
$function$;
drop trigger if exists integration_order_item_guard on public.integration_order_items;
create trigger integration_order_item_guard before insert on public.integration_order_items for each row execute function private.validate_integration_order_item();