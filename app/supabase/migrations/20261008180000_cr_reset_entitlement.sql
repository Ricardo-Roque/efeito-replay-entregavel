-- Upsell #01: Reset Emocional do Ex. Permissão separada do app principal.
--
-- Quem comprou só o Código da Reconquista NÃO recebe o Reset. O acesso vem de uma compra "paid" de um
-- produto com grants_reset. O app lê as permissões por cr_my_entitlements().
--
-- Liberação automática pelo webhook: quando chega um upsell novo cujo nome na Payt contém "reset",
-- ele já entra com grants_reset. Se o nome do produto na Payt for outro, marcar manualmente:
--   update public.cr_products set grants_reset = true where code = '<código do upsell na Payt>';

alter table public.cr_products add column grants_reset boolean not null default false;

-- O que a cliente logada comprou (o app usa para mostrar ou bloquear os módulos premium).
create function public.cr_my_entitlements() returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'app', coalesce(bool_or(pr.grants_app), false),
    'reset', coalesce(bool_or(pr.grants_reset), false)
  )
  from public.cr_purchases p
  join public.cr_products pr on pr.code = p.product_code
  where p.client_id = public.cr_current_client_id() and p.status = 'paid'
$$;
revoke execute on function public.cr_my_entitlements() from public, anon;
grant execute on function public.cr_my_entitlements() to authenticated;

-- Produto novo vindo do webhook: pedido principal libera o app; upsell com "reset" no nome libera o
-- Reset Emocional do Ex. Só muda o cadastro automático de produtos; o resto da função é igual.
create or replace function public.cr_register_payt_product() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.name ilike '%reset%' then
    new.grants_reset := true;
    new.grants_app := false;
  end if;
  return new;
end;
$$;
revoke execute on function public.cr_register_payt_product() from public, anon, authenticated;

create trigger cr_products_register before insert on public.cr_products
  for each row execute function public.cr_register_payt_product();
