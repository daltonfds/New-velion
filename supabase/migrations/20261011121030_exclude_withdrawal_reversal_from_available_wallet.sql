do $$
declare
  v_def text;
begin
  select pg_get_functiondef('private.seller_financials(uuid,integer)'::regprocedure) into v_def;
  if position('we.tipo in(''comissao'',''garantia_liberada'',''estorno'',''supplier_earning'')' in v_def) = 0 then
    raise exception 'Unexpected seller_financials definition; aborting safely';
  end if;
  v_def := replace(
    v_def,
    'we.estado=''disponivel'' and we.tipo in(''comissao'',''garantia_liberada'',''estorno'',''supplier_earning'')',
    'we.estado=''disponivel'' and (we.tipo in(''comissao'',''garantia_liberada'',''supplier_earning'') or (we.tipo=''estorno'' and we.sale_id is not null))'
  );
  execute v_def;

  select pg_get_functiondef('private.validate_withdrawal_payload(uuid,numeric,text,jsonb)'::regprocedure) into v_def;
  if position('we.tipo in (''supplier_earning'',''estorno'',''garantia_liberada'')' in v_def) = 0 then
    raise exception 'Unexpected validate_withdrawal_payload definition; aborting safely';
  end if;
  v_def := replace(
    v_def,
    'and we.tipo in (''supplier_earning'',''estorno'',''garantia_liberada'')',
    'and (we.tipo in (''supplier_earning'',''garantia_liberada'') or (we.tipo=''estorno'' and we.sale_id is not null))'
  );
  execute v_def;

  select pg_get_functiondef('public.get_admin_financial_summary(integer)'::regprocedure) into v_def;
  if position('we.tipo in (''comissao'',''garantia_liberada'',''estorno'')' in v_def) = 0 then
    raise exception 'Unexpected get_admin_financial_summary definition; aborting safely';
  end if;
  v_def := replace(
    v_def,
    'we.estado=''disponivel'' and we.tipo in (''comissao'',''garantia_liberada'',''estorno'')',
    'we.estado=''disponivel'' and (we.tipo in (''comissao'',''garantia_liberada'') or (we.tipo=''estorno'' and we.sale_id is not null))'
  );
  execute v_def;
end $$;
