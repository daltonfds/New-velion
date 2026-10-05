-- Integration fulfillment indexes.
create index if not exists fulfillment_events_created_by_idx on public.fulfillment_events(created_by);
create index if not exists fulfillment_order_items_product_idx on public.fulfillment_order_items(product_id);
create index if not exists integration_orders_fulfillment_order_idx on public.integration_orders(fulfillment_order_id);
create index if not exists integration_order_items_mapping_idx on public.integration_order_items(mapping_id);
create index if not exists integration_order_items_product_idx on public.integration_order_items(newvelion_product_id);
create index if not exists integration_orders_external_seller_idx on public.integration_orders(external_seller_id);
create index if not exists integration_product_mappings_external_seller_idx on public.integration_product_mappings(external_seller_id);
create index if not exists integration_product_mappings_product_idx on public.integration_product_mappings(newvelion_product_id);
