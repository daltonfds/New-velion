create or replace function private.sync_product_affiliation_availability()
returns trigger language plpgsql security definer set search_path=''
as $function$
begin
 if new.supplier_status<>'approved' or not new.ativo then
  update public.affiliations set ativo=false where product_id=new.id;
 elsif new.supplier_min_selling_price is not null then
  update public.affiliations set ativo=false where product_id=new.id and sale_price<new.supplier_min_selling_price;
 end if;
 return new;
end;
$function$;
drop trigger if exists product_affiliation_availability_trigger on public.products;
create trigger product_affiliation_availability_trigger after update of supplier_status,ativo,supplier_min_selling_price on public.products for each row execute function private.sync_product_affiliation_availability();