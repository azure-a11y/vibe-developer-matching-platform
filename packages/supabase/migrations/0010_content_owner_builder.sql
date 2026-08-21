-- 0010_content_owner_builder.sql
-- Adds nullable Builder ownership references for Work and Insight content.
-- Existing builder_ids/author values are intentionally not backfilled.

begin;

alter table public.works
  add column if not exists owner_builder_id uuid;

alter table public.posts
  add column if not exists owner_builder_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'works_owner_builder_fk'
      and conrelid = 'public.works'::regclass
  ) then
    alter table public.works
      add constraint works_owner_builder_fk
      foreign key (owner_builder_id)
      references public.builders(id)
      on delete restrict;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'posts_owner_builder_fk'
      and conrelid = 'public.posts'::regclass
  ) then
    alter table public.posts
      add constraint posts_owner_builder_fk
      foreign key (owner_builder_id)
      references public.builders(id)
      on delete restrict;
  end if;
end
$$;

create index if not exists works_owner_builder_id_idx
  on public.works (owner_builder_id);

create index if not exists posts_owner_builder_id_idx
  on public.posts (owner_builder_id);

commit;
