import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Login do Código da Reconquista só por e-mail (mesmo modelo do cb-login do CalmBaby): se o e-mail
// tem compra paga (cr_email_has_access), devolve um token de uso único que o app troca por sessão com
// supabase.auth.verifyOtp({ token_hash, type: "magiclink" }). Nenhum e-mail é enviado.
// Quem souber o e-mail de uma compradora consegue entrar na conta dela (risco aceito, igual ao Calm Kids).
// Os usuários de Auth são os mesmos do Calm Kids e do CalmBaby (mesmo projeto); o acesso a cada app é
// decidido pelas compras de cada um (cr_* x cb_* x ck_*), então comprar um não libera o outro.

const allowedOrigins = (Deno.env.get("CR_ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const corsHeaders = (req: Request) => {
  const origin = req.headers.get("Origin") ?? "";
  const allow =
    !allowedOrigins.length || allowedOrigins.includes(origin) ? origin || "*" : allowedOrigins[0]!;
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
};

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

Deno.serve(async (req) => {
  const headers = corsHeaders(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...headers, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  let email = "";
  try {
    const body = await req.json();
    email = String(body?.email ?? "")
      .trim()
      .toLowerCase();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  if (email.length > 255 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: "invalid_email" }, 400);
  }

  const access = await admin.rpc("cr_email_has_access", { p_email: email });
  if (access.error) {
    console.error("cr_email_has_access falhou", access.error.message);
    return json({ ok: false, error: "internal_error" }, 500);
  }
  if (!access.data) return json({ ok: false, error: "no_access" });

  const created = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (created.error && !/already|registered|exists/i.test(created.error.message)) {
    console.error("createUser falhou", created.error.message);
    return json({ ok: false, error: "internal_error" }, 500);
  }

  const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = link.data?.properties?.hashed_token;
  if (link.error || !tokenHash) {
    console.error("generateLink falhou", link.error?.message);
    return json({ ok: false, error: "internal_error" }, 500);
  }
  return json({ ok: true, token_hash: tokenHash });
});
