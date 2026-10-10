-- Correct notification recipients and make supplier/admin sale alerts independent of user sales preferences.
CREATE OR REPLACE FUNCTION private.notify_newvelion_sale()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','private'
AS $function$
DECLARE
  v_product text;
  v_supplier_id uuid;
  v_admin_id uuid;
  v_data jsonb;
BEGIN
  IF lower(coalesce(NEW.status,'')) <> 'paga'
     OR (TG_OP='UPDATE' AND lower(coalesce(OLD.status,''))='paga') THEN
    RETURN NEW;
  END IF;

  SELECT p.nome, p.created_by
    INTO v_product, v_supplier_id
    FROM public.products p
    WHERE p.id=NEW.product_id
    LIMIT 1;

  v_data := jsonb_build_object(
    'sale_id',NEW.id,
    'product_id',NEW.product_id,
    'product_name',coalesce(v_product,'Product'),
    'amount',NEW.valor_venda,
    'commission',NEW.comissao_vendedor,
    'status','Paid'
  );

  PERFORM private.create_newvelion_notification(
    NEW.vendedor_id,'sale_confirmed','Sale confirmed',
    CASE WHEN v_product IS NULL THEN 'A sale through your affiliate link has been confirmed.'
         ELSE 'Your sale of '||v_product||' has been confirmed.' END,
    'sale_confirmed:'||NEW.id::text,
    v_data || jsonb_build_object('target_url','/dashboard/seller/sales','recipient_role','seller')
  );

  IF v_supplier_id IS NOT NULL AND v_supplier_id <> NEW.vendedor_id
     AND EXISTS (SELECT 1 FROM public.profiles WHERE id=v_supplier_id AND role='supplier') THEN
    PERFORM private.create_newvelion_notification(
      v_supplier_id,'supplier_sale_confirmed','Your product has a confirmed sale',
      'A customer purchase of '||coalesce(v_product,'your product')||' has been approved. Prepare the order for fulfillment.',
      'supplier_sale_confirmed:'||NEW.id::text||':'||v_supplier_id::text,
      v_data || jsonb_build_object('target_url','/dashboard/supplier/orders','recipient_role','supplier')
    );
  END IF;

  FOR v_admin_id IN SELECT id FROM public.profiles WHERE role='admin' LOOP
    PERFORM private.create_newvelion_notification(
      v_admin_id,'admin_sale_confirmed','Sale approved — Newvelion',
      'Sale '||NEW.id::text||' for '||coalesce(v_product,'a product')||' was confirmed at R'||to_char(NEW.valor_venda,'FM999999990.00')||'.',
      'admin_sale_confirmed:'||NEW.id::text||':'||v_admin_id::text,
      v_data || jsonb_build_object('target_url','/dashboard/admin/checkout-sessions','recipient_role','admin')
    );
  END LOOP;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION private.notify_newvelion_withdrawal_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','private'
AS $function$
DECLARE
  v_admin_id uuid;
  v_requester_name text;
BEGIN
  IF lower(coalesce(NEW.status,'')) <> 'solicitado' THEN
    RETURN NEW;
  END IF;

  SELECT coalesce(p.full_name,p.nome_completo,'User')
    INTO v_requester_name
    FROM public.profiles p
    WHERE p.id=NEW.vendedor_id;

  FOR v_admin_id IN SELECT id FROM public.profiles WHERE role='admin' LOOP
    PERFORM private.create_newvelion_notification(
      v_admin_id,'withdrawal_requested','New withdrawal request',
      coalesce(v_requester_name,'A user')||' requested a withdrawal of R'||to_char(NEW.valor_solicitado,'FM999999990.00')||'. Review it in the admin dashboard.',
      'admin_withdrawal_requested:'||NEW.id::text||':'||v_admin_id::text,
      jsonb_build_object(
        'withdrawal_id',NEW.id,'amount',NEW.valor_solicitado,
        'wallet_currency',coalesce(NEW.wallet_currency,'ZAR'),
        'status',NEW.status,'requester_id',NEW.vendedor_id,
        'requester_name',v_requester_name,
        'target_url','/dashboard/admin/withdrawals','recipient_role','admin'
      )
    );
  END LOOP;
  RETURN NEW;
END;
$function$;
