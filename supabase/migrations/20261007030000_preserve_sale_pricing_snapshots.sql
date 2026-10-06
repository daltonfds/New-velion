-- Preserve immutable offer pricing snapshots when a sale is created.
drop function if exists public.create_public_checkout_session(text,text,text,text,text,text,text,text,text,text,text);

create or replace function private.calculate_sale_financials()
returns trigger
language plpgsql security definer set search_path=''
as $function$
declare
 p public.products%rowtype;
 s public.platform_settings%rowtype;
 a public.affiliations%rowtype;
 v_desired numeric;
 v_max_commission numeric;
 v_cost_zar numeric;
 v_qty integer;
begin
 select * into p from public.products where id=new.product_id for share;
 if not found then raise exception 'Product not found'; end if;
 if new.vendedor_id=p.created_by then raise exception 'Self-referral is not allowed'; end if;
 select * into s from public.platform_settings where id=true;

 v_qty:=greatest(coalesce(new.quantity,1),1);
 new.product_amount:=greatest(coalesce(new.product_amount,new.valor_venda-coalesce(new.shipping_amount,0)),0);
 new.taxa_gateway:=round(new.valor_venda*0.10,2);
 new.taxa_plataforma:=round(new.valor_venda*coalesce(s.transaction_fee_percent,10)/100,2);
 v_cost_zar:=greatest(coalesce(new.supplier_cost_zar,greatest(coalesce(p.preco_custo,0),0)*v_qty),0);

 if new.affiliation_id is not null then
   select * into a from public.affiliations where id=new.affiliation_id for share;
   if a.id is null then raise exception 'AFFILIATION_NOT_FOUND'; end if;
   if a.vendedor_id<>new.vendedor_id or a.product_id<>new.product_id then raise exception 'AFFILIATION_MISMATCH'; end if;

   if new.pricing_mode is null then new.pricing_mode:=a.pricing_mode; end if;
   if new.base_price_zar is null then new.base_price_zar:=a.base_price_zar; end if;
   if new.seller_margin_zar is null then new.seller_margin_zar:=greatest(coalesce(a.seller_margin_zar,0)*v_qty,0); end if;
   if new.commission_snapshot_zar is null then new.commission_snapshot_zar:=greatest(coalesce(a.commission_snapshot_zar,0)*v_qty,0); end if;

   v_desired:=case when new.pricing_mode='custom' then greatest(coalesce(new.seller_margin_zar,0),0)
                   else greatest(coalesce(new.commission_snapshot_zar,0),0) end;
 elsif new.pricing_mode='custom' then
   v_desired:=greatest(coalesce(new.seller_margin_zar,0),0);
 else
   if p.comissao_tipo='percentual' then v_desired:=round(new.product_amount*p.comissao_valor/100,2);
   else v_desired:=round(p.comissao_valor*v_qty,2);
   end if;
 end if;

 v_max_commission:=greatest(0,new.valor_venda-v_cost_zar-new.taxa_gateway-new.taxa_plataforma);
 new.comissao_vendedor:=least(greatest(v_desired,0),v_max_commission);
 new.ganho_plataforma:=greatest(0,new.valor_venda-new.taxa_gateway-new.comissao_vendedor-v_cost_zar);
 new.valor_garantia:=round(new.comissao_vendedor*0.10,2);
 new.garantia_libera_em:=coalesce(new.garantia_libera_em,new.vendido_em+make_interval(days=>coalesce(s.hold_days,7)));
 return new;
end;
$function$;