-- Código da Reconquista: produtos, clientes e compras (Payt) e regras de acesso ao app.
-- Roda no mesmo projeto do Calm Kids e do CalmBaby (Grupo RME), por isso tudo tem prefixo cr_ e
-- nada encosta nas tabelas ck_ e cb_. Cópia do modelo do CalmBaby (cb_schema + compras por produto
-- + formatação de nome), sem as tabelas do app, que entram numa migration própria.
--
-- Acesso ao app = existe compra "paid" de um produto com grants_app. Reembolso, chargeback e
-- cancelamento tiram o acesso sozinhos, porque o webhook atualiza o status da compra.
-- A lógica do webhook fica em cr_apply_payt_event (Postgres); a Edge Function cr-payt-webhook só
-- confere a chave da Payt e chama essa função.

-- ---------- Produtos, clientes e compras ----------

create table public.cr_products (
  code text primary key,
  name text not null,
  grants_app boolean not null default false,
  created_at timestamptz not null default now()
);
comment on table public.cr_products is
  'Produtos da Payt. Código novo que chega no webhook é cadastrado sozinho: pedido principal (type=order) já libera o app; upsell entra sem liberar nada. Ajustar grants_app manualmente se preciso.';

create table public.cr_clients (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email) and email = btrim(email)),
  name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Uma compra = transação + produto (order bump na mesma transação vira outra linha).
create table public.cr_purchases (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.cr_clients (id) on delete cascade,
  transaction_id text not null,
  product_code text not null references public.cr_products (code),
  status text not null,
  amount_cents integer check (amount_cents is null or amount_cents >= 0),
  payment_method text,
  paid_at timestamptz,
  utm jsonb,
  payt_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cr_purchases_transaction_product_key unique (transaction_id, product_code)
);
create index cr_purchases_client_id_idx on public.cr_purchases (client_id);
create index cr_purchases_product_code_idx on public.cr_purchases (product_code);

-- Registro de tudo que a Payt mandou (sem a chave de integração), para auditoria e suporte.
create table public.cr_webhook_events (
  id bigint generated always as identity primary key,
  received_at timestamptz not null default now(),
  transaction_id text,
  product_code text,
  event_type text,
  status text,
  action text not null,
  reason text,
  payload jsonb not null
);
create index cr_webhook_events_transaction_idx on public.cr_webhook_events (transaction_id);
create index cr_webhook_events_received_idx on public.cr_webhook_events using brin (received_at);

-- ---------- updated_at e nome ----------

create function public.cr_set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke execute on function public.cr_set_updated_at() from public, anon, authenticated;

create trigger cr_clients_updated_at before update on public.cr_clients
  for each row execute function public.cr_set_updated_at();
create trigger cr_purchases_updated_at before update on public.cr_purchases
  for each row execute function public.cr_set_updated_at();

-- Nome sempre em "Primeira Letra Maiúscula", com de/da/do/das/dos/e em minúsculas.
create function public.cr_format_person_name(p_name text) returns text
language sql immutable set search_path = ''
as $$
  select nullif(string_agg(
    case when w.i > 1 and w.word in ('de', 'da', 'do', 'das', 'dos', 'e', 'di', 'du') then w.word else initcap(w.word) end,
    ' ' order by w.i), '')
  from unnest(regexp_split_to_array(lower(btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'))), ' ')) with ordinality as w(word, i)
  where w.word <> ''
$$;
revoke execute on function public.cr_format_person_name(text) from public, anon, authenticated;

create function public.cr_clients_format_name() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.name = public.cr_format_person_name(new.name);
  return new;
end;
$$;
revoke execute on function public.cr_clients_format_name() from public, anon, authenticated;

create trigger cr_clients_format_name before insert or update of name on public.cr_clients
  for each row execute function public.cr_clients_format_name();

-- ---------- Acesso ----------

-- Cliente logado com compra ativa (null se não tem acesso). Base das policies do app.
create function public.cr_current_client_id() returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select c.id
  from public.cr_clients c
  where c.email = lower(coalesce(auth.jwt() ->> 'email', ''))
    and exists (
      select 1
      from public.cr_purchases p
      join public.cr_products pr on pr.code = p.product_code
      where p.client_id = c.id and p.status = 'paid' and pr.grants_app
    )
$$;
revoke execute on function public.cr_current_client_id() from public, anon;
grant execute on function public.cr_current_client_id() to authenticated;

-- Usada só pela função de login (service role). Não pode ficar exposta: permitiria descobrir
-- quem é comprador a partir de um e-mail.
create function public.cr_email_has_access(p_email text) returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.cr_clients c
    join public.cr_purchases p on p.client_id = c.id
    join public.cr_products pr on pr.code = p.product_code
    where c.email = lower(btrim(p_email)) and p.status = 'paid' and pr.grants_app
  )
$$;
revoke execute on function public.cr_email_has_access(text) from public, anon, authenticated;

-- ---------- RLS ----------

alter table public.cr_products enable row level security;
alter table public.cr_clients enable row level security;
alter table public.cr_purchases enable row level security;
alter table public.cr_webhook_events enable row level security;

-- Supabase concede tudo a anon/authenticated por padrão em tabelas novas do schema public.
-- Nada aqui é lido direto pelo app ainda; o acesso entra junto com o login.
revoke all on public.cr_products, public.cr_clients, public.cr_purchases, public.cr_webhook_events
  from anon, authenticated;

grant select (id, email, name) on public.cr_clients to authenticated;
create policy cr_clients_select_own on public.cr_clients for select to authenticated
  using (id = public.cr_current_client_id());

-- ---------- Webhook da Payt ----------

-- Payt manda horário de Brasília sem fuso: "2026-09-21 14:23:46.000000".
create function public.cr_parse_payt_date(p_value text) returns timestamptz
language sql
stable
set search_path = ''
as $$
  select case
    when p_value ~ '^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}'
      then (substring(p_value from 1 for 10) || ' ' || substring(p_value from 12 for 8))::timestamp
           at time zone 'America/Sao_Paulo'
  end
$$;
revoke execute on function public.cr_parse_payt_date(text) from public, anon, authenticated;

-- Aplica um evento da Payt. Idempotente: reenvio não duplica, evento atrasado não volta o status.
-- Retorna o que fez, e registra tudo em cr_webhook_events.
create function public.cr_apply_payt_event(p_event jsonb, p_accept_tests boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_type text := p_event ->> 'type';
  v_transaction text := nullif(btrim(p_event ->> 'transaction_id'), '');
  v_product text := nullif(btrim(p_event -> 'product' ->> 'code'), '');
  v_product_name text := coalesce(nullif(btrim(p_event -> 'product' ->> 'name'), ''), v_product);
  v_email text := lower(btrim(coalesce(p_event -> 'customer' ->> 'email', '')));
  v_status text;
  v_event_at timestamptz;
  v_existing_at timestamptz;
  v_existing boolean;
  v_client uuid;
  v_total jsonb := p_event -> 'transaction' -> 'total_price';
  v_result jsonb;
begin
  v_status := case when p_event ->> 'status' = 'canceled' then 'canceled'
    else coalesce(p_event -> 'transaction' ->> 'payment_status', p_event ->> 'status', 'unknown') end;

  if v_type is null or v_type not in ('order', 'upsell', 'manual_upsell') then
    v_result := jsonb_build_object('action', 'ignored', 'reason', 'type:' || coalesce(v_type, 'null'));
  elsif (p_event ->> 'test') = 'true' and not p_accept_tests then
    v_result := jsonb_build_object('action', 'ignored', 'reason', 'test');
  elsif v_transaction is null then
    v_result := jsonb_build_object('action', 'ignored', 'reason', 'no_transaction_id');
  elsif v_product is null then
    v_result := jsonb_build_object('action', 'ignored', 'reason', 'no_product');
  elsif (p_event -> 'customer' ->> 'fake_email') = 'true'
     or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
     or length(v_email) > 255 then
    v_result := jsonb_build_object('action', 'ignored', 'reason', 'invalid_email');
  else
    v_event_at := coalesce(public.cr_parse_payt_date(p_event ->> 'updated_at'), now());

    -- Serializa eventos da mesma compra (a Payt pode mandar dois quase juntos).
    perform pg_advisory_xact_lock(hashtext('cr_payt:' || v_transaction || ':' || v_product));

    select true, payt_updated_at into v_existing, v_existing_at
    from public.cr_purchases where transaction_id = v_transaction and product_code = v_product;

    if v_existing and v_existing_at is not null and v_existing_at > v_event_at then
      v_result := jsonb_build_object('action', 'ignored', 'reason', 'stale');
    else
      -- Produto novo: este postback é só do Código da Reconquista, então o pedido principal
      -- (type=order) já libera o app; upsell entra sem liberar nada.
      insert into public.cr_products (code, name, grants_app)
      values (v_product, left(v_product_name, 200), v_type = 'order')
      on conflict (code) do nothing;

      insert into public.cr_clients (email, name, phone)
      values (
        v_email,
        nullif(left(btrim(coalesce(p_event -> 'customer' ->> 'name', '')), 120), ''),
        nullif(regexp_replace(coalesce(p_event -> 'customer' ->> 'phone', ''), '\D', '', 'g'), '')
      )
      on conflict (email) do update
        set name = coalesce(public.cr_clients.name, excluded.name),
            phone = coalesce(public.cr_clients.phone, excluded.phone)
      returning id into v_client;

      insert into public.cr_purchases as p (
        client_id, transaction_id, product_code, status, amount_cents, payment_method, paid_at, utm, payt_updated_at
      ) values (
        v_client,
        v_transaction,
        v_product,
        left(v_status, 40),
        case when jsonb_typeof(v_total) = 'number' and (v_total)::numeric >= 0 and (v_total)::numeric = floor((v_total)::numeric)
          then (v_total)::numeric::integer end,
        nullif(left(p_event -> 'transaction' ->> 'payment_method', 40), ''),
        public.cr_parse_payt_date(p_event -> 'transaction' ->> 'paid_at'),
        case when jsonb_typeof(p_event -> 'link' -> 'sources') = 'object' then p_event -> 'link' -> 'sources' end,
        v_event_at
      )
      on conflict (transaction_id, product_code) do update
        set client_id = excluded.client_id,
            status = excluded.status,
            amount_cents = coalesce(excluded.amount_cents, p.amount_cents),
            payment_method = coalesce(excluded.payment_method, p.payment_method),
            paid_at = coalesce(excluded.paid_at, p.paid_at),
            utm = coalesce(excluded.utm, p.utm),
            payt_updated_at = excluded.payt_updated_at;

      v_result := jsonb_build_object(
        'action', case when v_existing then 'updated' else 'created' end,
        'status', v_status
      );
    end if;
  end if;

  insert into public.cr_webhook_events (transaction_id, product_code, event_type, status, action, reason, payload)
  values (v_transaction, v_product, v_type, v_status, v_result ->> 'action', v_result ->> 'reason', p_event - 'integration_key');

  return v_result || jsonb_build_object('transaction_id', v_transaction, 'product_code', v_product);
end;
$$;
revoke execute on function public.cr_apply_payt_event(jsonb, boolean) from public, anon, authenticated;
