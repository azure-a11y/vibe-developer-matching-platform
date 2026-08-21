-- 0009_admin_account_builder_role.sql
-- Adds the first-stage account role split and links builder accounts to builders.
-- Existing rows remain administrator accounts.

alter table public.admin_accounts
  add column if not exists role text not null default 'admin',
  add column if not exists builder_id uuid;

update public.admin_accounts
set role = 'admin'
where role is null or role not in ('admin', 'builder');

alter table public.admin_accounts
  add constraint admin_accounts_role_check
    check (role in ('admin', 'builder'));

alter table public.admin_accounts
  add constraint admin_accounts_builder_fk
    foreign key (builder_id) references public.builders(id) on delete restrict;

alter table public.admin_accounts
  add constraint admin_accounts_role_builder_check
    check (
      (role = 'admin' and builder_id is null)
      or (role = 'builder' and builder_id is not null)
    );

create unique index if not exists admin_accounts_builder_id_unique
  on public.admin_accounts (builder_id)
  where role = 'builder';

comment on column public.admin_accounts.role is
  'Authentication role: admin or builder.';

comment on column public.admin_accounts.builder_id is
  'Builder profile linked to a builder account; required only for role=builder.';
