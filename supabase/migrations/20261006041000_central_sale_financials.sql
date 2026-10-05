alter table public.sales add column if not exists taxa_plataforma numeric not null default 0;
alter table public.sales add column if not exists ganho_plataforma numeric not null default 0;

create or replace function private.calculate_sale_financials()
returns trigger language plpgsql security definer set search_path=''
as $function$
declare p public.products%rowtype; s public.platform_settings%rowtype; v_desired numeric; v_max_commission numeric; v_cost numeric;
begin
 select * into p from public.products where id=new.product_id for share;
 if not found then raise exception 'Product not found'; end if;
 if new.vendedor_id=p.created_by then raise exception 'Self-referral is not allowed'; end if;
 select * into s from public.platform_settings where id=true;
 new.taxa_gateway:=round(new.valor_venda*0.10,2);
 new.taxa_plataforma:=round(new.valor_venda*coalesce(s.transaction_fee_percent,10)/100,2);
 v_cost:=greatest(coalesce(p.preco_custo,0),0);
 if p.comissao_tipo='percentual' then v_desired:=round(new.valor_venda*p.comissao_valor/100,2); else v_desired:=round(p.comissao_valor,2); end if;
 v_max_commission:=greatest(0,new.valor_venda-v_cost-new.taxa_gateway-new.taxa_plataforma);
 new.comissao_vendedor:=least(greatest(v_desired,0),v_max_commission);
 new.ganho_plataforma:=greatest(0,new.valor_venda-new.taxa_gateway-new.comissao_vendedor-v_cost);
 new.valor_garantia:=round(new.comissao_vendedor*0.10,2);
 new.garantia_libera_em:=coalesce(new.garantia_libera_em,new.vendido_em+make_interval(days=>coalesce(s.hold_days,7)));
 return new;
end;
$function$;