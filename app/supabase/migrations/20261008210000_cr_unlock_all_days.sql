-- Liberação manual dos 21 dias para uma cliente específica (sem esperar o calendário).
--
-- Por padrão cada dia do plano só abre depois que o anterior foi concluído num dia anterior. Com
-- unlock_all, todos os dias aparecem abertos no app. Não dá acesso ao app nem ao Reset: isso continua
-- vindo das compras. Ligar/desligar manualmente:
--   update public.cr_clients set unlock_all = true where email = '<e-mail>';

alter table public.cr_clients add column unlock_all boolean not null default false;

create or replace function public.cr_my_entitlements() returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'app', coalesce(bool_or(pr.grants_app), false),
    'reset', coalesce(bool_or(pr.grants_reset), false),
    'all_days', coalesce(
      (select c.unlock_all from public.cr_clients c where c.id = public.cr_current_client_id()),
      false
    )
  )
  from public.cr_purchases p
  join public.cr_products pr on pr.code = p.product_code
  where p.client_id = public.cr_current_client_id() and p.status = 'paid'
$$;
