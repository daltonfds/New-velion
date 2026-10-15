-- Allow public product reviews without weakening moderation.
alter table public.product_reviews
  alter column reviewer_id drop not null,
  alter column purchase_session_id drop not null;

alter table public.product_reviews
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists email text,
  add column if not exists photo_urls text[] not null default '{}',
  add column if not exists media_urls text[] not null default '{}';

alter table public.product_reviews
  alter column status set default 'pending';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.product_reviews'::regclass
      and conname = 'product_reviews_rating_range_check'
  ) then
    alter table public.product_reviews
      add constraint product_reviews_rating_range_check check (rating between 1 and 5);
  end if;
end $$;

alter table public.product_reviews enable row level security;
grant insert on public.product_reviews to anon;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'product_reviews'
      and policyname = 'Anyone can submit pending anonymous product reviews'
  ) then
    create policy "Anyone can submit pending anonymous product reviews"
      on public.product_reviews
      for insert
      to anon
      with check (
        reviewer_id is null
        and status = 'pending'
        and coalesce(verified_buyer, false) = false
        and rating between 1 and 5
        and first_name is not null
        and length(trim(first_name)) between 1 and 80
        and email is not null
        and length(trim(email)) between 3 and 254
        and length(trim(review_text)) between 5 and 5000
      );
  end if;
end $$;

-- The API uploads files after checking type and size using the server-only service key.
-- The bucket is public-read so approved review media can be displayed, but direct anonymous
-- storage uploads are intentionally not granted to prevent unbounded public file uploads.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-review-media',
  'product-review-media',
  true,
  26214400,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']
)
on conflict (id) do update
set public = true,
    file_size_limit = 26214400,
    allowed_mime_types = excluded.allowed_mime_types;

-- Keep both media fields aligned for compatibility with existing review cards/admin views.
create or replace function public.sync_product_review_media_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.media_urls is null then new.media_urls := '{}'::text[]; end if;
  if new.photo_urls is null then new.photo_urls := new.media_urls; end if;
  if cardinality(new.media_urls) = 0 and cardinality(new.photo_urls) > 0 then
    new.media_urls := new.photo_urls;
  elsif cardinality(new.photo_urls) = 0 and cardinality(new.media_urls) > 0 then
    new.photo_urls := new.media_urls;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_product_review_media_fields on public.product_reviews;
create trigger sync_product_review_media_fields
before insert or update of media_urls, photo_urls on public.product_reviews
for each row execute function public.sync_product_review_media_fields();
