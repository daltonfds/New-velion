create or replace function private.post_sale_to_ledger()
returns trigger language plpgsql security definer set search_path=''
as $function$
declare v_product public.products%rowtype; v_supplier_id uuid; v_supplier_amount numeric;
begin
 insert into public.wallet_entries(vendedor_id,sale_id,tipo,valor,estado)
 values(new.vendedor_id,new.id,'comissao',new.comissao_vendedor-new.valor_garantia,'disponivel'),
       (new.vendedor_id,new.id,'garantia_retida',new.valor_garantia,'retido');
 select p.* into v_product from public.products p where p.id=new.product_id;
 if found then
  select pr.id into v_supplier_id from public.profiles pr where pr.id=v_product.created_by and pr.role='supplier';
  v_supplier_amount:=greatest(coalesce(v_product.preco_custo,0),0)*greatest(coalesce(new.quantity,1),1);
  if v_supplier_id is not null and v_supplier_amount>0 then
   insert into public.wallet_entries(vendedor_id,sale_id,tipo,valor,estado) values(v_supplier_id,new.id,'supplier_earning',v_supplier_amount,'retido')
   on conflict(sale_id,vendedor_id,tipo) do nothing;
  end if;
 end if;
 return new;
end;
$function$;