create index if not exists supplier_profiles_approved_by_idx on public.supplier_profiles(approved_by);
create index if not exists products_supplier_reviewed_by_idx on public.products(supplier_reviewed_by);
