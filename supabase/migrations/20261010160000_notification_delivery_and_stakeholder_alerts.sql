-- Queue outbound notifications to avoid provider rate limits and notify all stakeholders.
select vault.create_secret('BOXBAcFbNi2ex8YdHZZuXd-Afl3Ub0-E305V3xF4CkyoSDeVHtnAN9e4MnEsBxAIGKJ4BwwJbGul644A33zTuV0','newvelion_vapid_public_key','Web Push VAPID public key',null::uuid)
where not exists (select 1 from vault.secrets where name='newvelion_vapid_public_key');
select vault.create_secret('HLlcAIJlqYcXwWSiRmp13ot8dMZf8ELwNZMLLhBmUWs','newvelion_vapid_private_key','Web Push VAPID private key',null::uuid)
where not exists (select 1 from vault.secrets where name='newvelion_vapid_private_key');

CREATE OR REPLACE FUNCTION private.dispatch_newvelion_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','private'
AS $function$
BEGIN
  -- Notifications are delivered by the rate-limited cron worker, not in parallel inside transactions.
  RETURN NEW;
END;
$function$;

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
    'status','Paid',
    'target_url','/dashboard/seller/sales'
  );

  PERFORM private.create_newvelion_notification(
    NEW.vendedor_id,
    'sale_confirmed',
    'Sale confirmed',
    CASE WHEN v_product IS NULL THEN 'A sale through your affiliate link has been confirmed.'
         ELSE 'Your sale of '||v_product||' has been confirmed.' END,
    'sale_confirmed:'||NEW.id::text,
    v_data
  );

  IF v_supplier_id IS NOT NULL AND v_supplier_id <> NEW.vendedor_id
     AND EXISTS (SELECT 1 FROM public.profiles WHERE id=v_supplier_id AND role='supplier') THEN
    PERFORM private.create_newvelion_notification(
      v_supplier_id,
      'sale_confirmed',
      'Your product has a confirmed sale',
      'A customer purchase of '||coalesce(v_product,'your product')||' has been approved. Prepare the order for fulfillment.',
      'supplier_sale_confirmed:'||NEW.id::text||':'||v_supplier_id::text,
      v_data || jsonb_build_object('target_url','/dashboard/supplier/orders','recipient_role','supplier')
    );
  END IF;

  FOR v_admin_id IN SELECT id FROM public.profiles WHERE role='admin' LOOP
    PERFORM private.create_newvelion_notification(
      v_admin_id,
      'sale_confirmed',
      'Sale approved — Newvelion',
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

  SELECT coalesce(p.full_name,p.nome_completo,p.email,'User')
    INTO v_requester_name
    FROM public.profiles p
    WHERE p.id=NEW.vendedor_id;

  FOR v_admin_id IN SELECT id FROM public.profiles WHERE role='admin' LOOP
    PERFORM private.create_newvelion_notification(
      v_admin_id,
      'withdrawal_requested',
      'New withdrawal request',
      coalesce(v_requester_name,'A user')||' requested a withdrawal of R'||to_char(NEW.valor_solicitado,'FM999999990.00')||'. Review and approve or reject it in the admin dashboard.',
      'admin_withdrawal_requested:'||NEW.id::text||':'||v_admin_id::text,
      jsonb_build_object(
        'withdrawal_id',NEW.id,
        'amount',NEW.valor_solicitado,
        'wallet_currency',coalesce(NEW.wallet_currency,'ZAR'),
        'status',NEW.status,
        'requester_id',NEW.vendedor_id,
        'requester_name',v_requester_name,
        'target_url','/dashboard/admin/withdrawals',
        'recipient_role','admin'
      )
    );
  END LOOP;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS withdrawal_request_admin_notification ON public.withdrawals;
CREATE TRIGGER withdrawal_request_admin_notification
AFTER INSERT ON public.withdrawals
FOR EACH ROW EXECUTE FUNCTION private.notify_newvelion_withdrawal_request();

-- Replace the old cron URL (it returned HTTP 404 every minute) with the deployed dispatcher.
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname='newvelion-notification-processor';

SELECT cron.schedule(
  'newvelion-notification-processor',
  '* * * * *',
  $cron$
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='newvelion_project_url')
        || '/functions/v1/notification-dispatcher-v3',
      headers := jsonb_build_object(
        'Content-Type','application/json',
        'x-newvelion-dispatch',(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='newvelion_notification_dispatch')
      ),
      body := jsonb_build_object('notification_id', q.id),
      timeout_milliseconds := 15000
    )
    FROM (
      SELECT n.id,
             coalesce(
               (SELECT max(d.updated_at) FROM public.notification_deliveries d WHERE d.notification_id=n.id),
               n.created_at
             ) AS last_attempt
      FROM public.notifications n
      JOIN auth.users u ON u.id=n.user_id
      LEFT JOIN public.account_settings s ON s.user_id=n.user_id
      WHERE (
        (
          coalesce(s.email_notifications,true)
          AND u.email IS NOT NULL
          AND (n.type <> 'sale_confirmed' OR coalesce(s.sales_notifications,true))
          AND NOT EXISTS (
            SELECT 1 FROM public.notification_deliveries d
            WHERE d.notification_id=n.id AND d.channel='email' AND d.status='sent'
          )
        )
        OR
        (
          EXISTS (SELECT 1 FROM public.push_subscriptions ps WHERE ps.user_id=n.user_id)
          AND (n.type <> 'sale_confirmed' OR coalesce(s.sales_notifications,true))
          AND NOT EXISTS (
            SELECT 1 FROM public.notification_deliveries d
            WHERE d.notification_id=n.id AND d.channel='push' AND d.status='sent'
          )
        )
      )
      ORDER BY last_attempt ASC, n.created_at ASC
      LIMIT 5
    ) q;
  $cron$
);

