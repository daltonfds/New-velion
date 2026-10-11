CREATE OR REPLACE FUNCTION private.notify_newvelion_withdrawal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public','private'
AS $function$
DECLARE
  v_amount text;
  v_currency text;
  v_title text;
  v_message text;
BEGIN
  IF new.status IN ('pago','rejeitado') AND old.status IS DISTINCT FROM new.status THEN
    v_amount := to_char(coalesce(new.valor_solicitado,0),'FM999999990.00');
    v_currency := coalesce(nullif(new.wallet_currency,''),'ZAR');

    IF new.status='pago' THEN
      v_title := 'Withdrawal confirmed - ' || v_currency || ' ' || v_amount;
      v_message := 'Withdrawal confirmed - ' || v_currency || ' ' || v_amount ||
        '. Net amount: ' || to_char(coalesce(new.valor_liquido,0),'FM999999990.00') || ' ' || v_currency ||
        '. Withdrawal ID: ' || new.id::text ||
        '. Payment method: ' || coalesce(new.dados_pagamento->>'provider','') ||
        '. Date: ' || to_char(coalesce(new.processado_em,now()),'YYYY-MM-DD HH24:MI:SS TZH:TZM') || '.';
    ELSE
      v_title := 'Withdrawal rejected - ' || v_currency || ' ' || v_amount;
      v_message := 'Withdrawal rejected - ' || v_currency || ' ' || v_amount ||
        '. Withdrawal ID: ' || new.id::text ||
        '. Date: ' || to_char(coalesce(new.processado_em,now()),'YYYY-MM-DD HH24:MI:SS TZH:TZM') || '.';
    END IF;

    PERFORM private.create_newvelion_notification(
      new.vendedor_id,
      case when new.status='pago' then 'withdrawal_approved' else 'withdrawal_rejected' end,
      v_title,
      v_message,
      'withdrawal:' || new.id::text || ':' || new.status,
      jsonb_build_object(
        'withdrawal_id',new.id,
        'status',new.status,
        'amount',new.valor_solicitado,
        'requested_amount',new.valor_solicitado,
        'net_amount',new.valor_liquido,
        'wallet_currency',new.wallet_currency,
        'payout_currency',new.payout_currency,
        'exchange_rate',new.exchange_rate,
        'converted_amount',new.valor_convertido,
        'wallet_provider',new.dados_pagamento->>'provider',
        'wallet_phone',new.dados_pagamento->>'phone',
        'processed_at',coalesce(new.processado_em,now()),
        'target_url','/dashboard/seller/withdrawals'
      )
    );
  END IF;
  RETURN new;
END;
$function$;