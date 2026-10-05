create or replace function private.notify_supplier_lifecycle()
returns trigger language plpgsql security definer set search_path='public','private'
as $function$
declare v_user uuid; v_type text; v_title text; v_message text; v_key text;
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
   perform private.create_newvelion_notification(new.supplier_id,v_type,v_title,v_message,v_key,jsonb_build_object('fulfillment_order_id',new.id,'status',new.status,'total',new.total,'tracking_number',new.tracking_number));
  end if;
 end if;
 return new;
end;
$function$;

drop trigger if exists supplier_profile_notification_trigger on public.supplier_profiles;
create trigger supplier_profile_notification_trigger after update of approval_status on public.supplier_profiles for each row execute function private.notify_supplier_lifecycle();
drop trigger if exists supplier_product_notification_trigger on public.products;
create trigger supplier_product_notification_trigger after update of supplier_status on public.products for each row execute function private.notify_supplier_lifecycle();
drop trigger if exists supplier_fulfillment_notification_trigger on public.fulfillment_orders;
create trigger supplier_fulfillment_notification_trigger after insert or update of status on public.fulfillment_orders for each row execute function private.notify_supplier_lifecycle();