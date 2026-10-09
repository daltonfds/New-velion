-- Permit the two notification types emitted by the platform affiliate activation workflow.
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
check (type = any (array[
  'sale_confirmed'::text,
  'withdrawal_approved'::text,
  'withdrawal_rejected'::text,
  'supplier_approved'::text,
  'supplier_rejected'::text,
  'supplier_suspended'::text,
  'supplier_status'::text,
  'product_approved'::text,
  'product_rejected'::text,
  'product_suspended'::text,
  'product_review_status'::text,
  'supplier_order_created'::text,
  'supplier_order_status'::text,
  'order_paid'::text,
  'order_processing'::text,
  'order_packed'::text,
  'order_shipped'::text,
  'order_delivered'::text,
  'order_exception'::text,
  'order_status'::text,
  'account_activated'::text,
  'mystery_prize_unlocked'::text
]));
