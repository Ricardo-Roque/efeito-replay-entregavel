import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Postback da Payt para o Código da Reconquista -> cr_clients / cr_purchases (via cr_apply_payt_event
// no Postgres). Cópia do cb-payt-webhook do CalmBaby.
// A Payt não assina o corpo: o único segredo é `integration_key` dentro do JSON. Usa o segredo
// CR_PAYT_INTEGRATION_KEY se existir; senão o mesmo PAYT_INTEGRATION_KEY do Calm Kids (mesma conta Payt).
// Aceitar eventos de teste da Payt: segredo CR_PAYT_ACCEPT_TEST=true.
// Responde 500 em erro de banco para a Payt tentar de novo; o processamento é idempotente.

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  {
    auth: { persistSession: false },
  },
);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const safeEqual = (a: string, b: string) => {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
};

const MAX_EVENTS = 50;

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const secret = Deno.env.get("CR_PAYT_INTEGRATION_KEY") || Deno.env.get("PAYT_INTEGRATION_KEY");
  if (!secret) {
    console.error("CR_PAYT_INTEGRATION_KEY / PAYT_INTEGRATION_KEY não configurada");
    return json({ error: "not_configured" }, 500);
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const events = (Array.isArray(payload) ? payload : [payload]) as Record<string, unknown>[];
  if (
    !events.length ||
    events.length > MAX_EVENTS ||
    events.some((e) => typeof e !== "object" || e === null || Array.isArray(e))
  ) {
    return json({ error: "invalid_payload" }, 400);
  }
  if (
    events.some(
      (e) => typeof e.integration_key !== "string" || !safeEqual(e.integration_key, secret),
    )
  ) {
    console.warn("payt: integration_key inválida");
    return json({ error: "unauthorized" }, 401);
  }

  const acceptTests = Deno.env.get("CR_PAYT_ACCEPT_TEST") === "true";
  const results: unknown[] = [];
  for (const event of events) {
    const { integration_key: _key, ...clean } = event;
    const { data, error } = await supabase.rpc("cr_apply_payt_event", {
      p_event: clean,
      p_accept_tests: acceptTests,
    });
    if (error) {
      console.error("cr_apply_payt_event falhou", error.message);
      return json({ error: "internal_error" }, 500);
    }
    results.push(data);
  }
  console.log(JSON.stringify(results));
  return json({ ok: true, results });
});
