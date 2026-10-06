-- Customer tracking token and fulfillment lifecycle notifications.
alter table public.fulfillment_orders
  add column if not exists public_tracking_token text;

alter table public.fulfillment_orders
  alter column public_tracking_token set default replace(gen_random_uuid()::text, '-', '');

update public.fulfillment_orders
set public_tracking_token = replace(gen_random_uuid()::text, '-', '')
where public_tracking_token is null;

create unique index if not exists fulfillment_orders_public_tracking_token_idx
  on public.fulfillment_orders(public_tracking_token);

alter table public.fulfillment_orders
  alter column public_tracking_token set not null;

create or replace function private.notify_supplier_lifecycle()
returns trigger
language plpgsql
security definer
set search_path='public','private'
as $function$
declare
  v_user uuid;
  v_type text;
  v_title text;
  v_message text;
  v_key text;
  v_sale public.sales%rowtype;
begin
  if tg_table_name='supplier_profiles' then
    v_user:=new.user_id;
    if new.approval_status is distinct from old.approval_status then
      v_type:=case new.approval_status when 'approved' then 'supplier_approved' when 'rejected' then 'supplier_rejected' when 'suspended' then 'supplier_suspended' else 'supplier_status' end;
      v_title:=case new.approval_status when 'approved' then 'Supplier account approved' when 'rejected' then 'Supplier application rejected' when 'suspended' then 'Supplier account suspended' else 'Supplier application updated' end;
      v_message:=case new.approval_status when 'approved' then 'Your supplier account has been approved. You can now submit products for marketplace review.' when 'rejected' then 'Your supplier application was rejected. Review the feedback in your supplier dashboard.' when 'suspended' then 'Your supplier account has been suspended. Contact NewVelion support for assistance.' else 'Your supplier application status has changed.' end;
      v_key:='supplier-status:'||new.user_id||':'||new.approval_status||':'||coalesce(new.updated_at::text,'');
      perform private.create_newvelion_notification(v_user,v_type,v_title,v_message,v_key,jsonb_build_object('status',new.approval_status,'reason',new.rejection_reason));
    end if;
  elsif tg_table_name='products' then
    if new.supplier_status is distinct from old.supplier_status then
      v_user:=new.created_by;
      v_type:=case new.supplier_status when 'approved' then 'product_approved' when 'rejected' then 'product_rejected' when 'suspended' then 'product_suspended' else 'product_review_status' end;
      v_title:=case new.supplier_status when 'approved' then 'Product approved' when 'rejected' then 'Product rejected' when 'suspended' then 'Product suspended' else 'Product review updated' end;
      v_message:=case new.supplier_status when 'approved' then 'Your product has been approved and is now eligible for the marketplace.' when 'rejected' then 'Your product was rejected. Review the feedback and update it before resubmitting.' when 'suspended' then 'Your product has been suspended from the marketplace.' else 'Your product review status has changed.' end;
      v_key:='product-status:'||new.id||':'||new.supplier_status||':'||coalesce(new.supplier_reviewed_at::text,new.updated_at::text);
      perform private.create_newvelion_notification(v_user,v_type,v_title,v_message,v_key,jsonb_build_object('product_id',new.id,'product_name',new.nome,'status',new.supplier_status,'reason',new.supplier_rejection_reason));
    end if;
  elsif tg_table_name='fulfillment_orders' then
    if new.supplier_id is not null and (tg_op='INSERT' or new.status is distinct from old.status) then
      v_type:=case when tg_op='INSERT' then 'supplier_order_created' else 'supplier_order_status' end;
      v_title:=case when tg_op='INSERT' then 'New supplier order' else 'Supplier order updated' end;
      v_message:=case when tg_op='INSERT' then 'A new paid order has been routed to your fulfillment queue.' else 'An order in your fulfillment queue changed status to '||new.status||'.' end;
      v_key:='supplier-fulfillment:'||new.id||':'||new.status;
      perform private.create_newvelion_notification(new.supplier_id,v_type,v_title,v_message,v_key,jsonb_build_object('fulfillment_order_id',new.id,'status',new.status,'total',new.total,'tracking_number',new.tracking_number,'tracking_url',new.tracking_url));
    end if;

    if new.sale_id is not null and (tg_op='INSERT' or new.status is distinct from old.status or new.tracking_number is distinct from old.tracking_number) then
      select * into v_sale from public.sales where id=new.sale_id;
      if v_sale.vendedor_id is not null then
        v_type:=case
          when new.status='confirmed' then 'order_paid'
          when new.status='processing' then 'order_processing'
          when new.status='packed' then 'order_packed'
          when new.status in ('shipped','in_transit') then 'order_shipped'
          when new.status='delivered' then 'order_delivered'
          when new.status in ('cancelled','failed','returned') then 'order_exception'
          else 'order_status'
        end;
        v_title:=case
          when new.status='confirmed' then 'Order paid'
          when new.status='processing' then 'Order being prepared'
          when new.status='packed' then 'Order packed'
          when new.status in ('shipped','in_transit') then 'Order shipped'
          when new.status='delivered' then 'Order delivered'
          when new.status in ('cancelled','failed','returned') then 'Order exception'
          else 'Order status updated'
        end;
        v_message:=case
          when new.status='confirmed' then 'A customer order linked to your sale has been paid and sent to fulfillment.'
          when new.status='processing' then 'The supplier has started preparing the order.'
          when new.status='packed' then 'The supplier has packed the order.'
          when new.status in ('shipped','in_transit') then 'The order is on its way.'||case when new.tracking_number is not null then ' Tracking: '||new.tracking_number else '' end
          when new.status='delivered' then 'The customer order has been marked as delivered.'
          when new.status in ('cancelled','failed','returned') then 'The order changed to '||new.status||'.'
          else 'The fulfillment order changed to '||new.status||'.'
        end;
        v_key:='seller-fulfillment:'||new.id||':'||new.status||':'||coalesce(new.tracking_number,'');
        perform private.create_newvelion_notification(v_sale.vendedor_id,v_type,v_title,v_message,v_key,jsonb_build_object('fulfillment_order_id',new.id,'sale_id',new.sale_id,'status',new.status,'tracking_number',new.tracking_number,'tracking_url',new.tracking_url));
      end if;
    end if;
  end if;
  return new;
end;
$function$;

