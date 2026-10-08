import { createClient } from "@supabase/supabase-js";

// Supabase do Grupo RME (o mesmo do Calm Kids e do CalmBaby; tabelas cr_*). A chave publicável é
// pública por definição (vai no navegador de qualquer forma): fica como padrão aqui para o deploy
// não depender de variável. Dá para trocar pelo .env (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).
const env = (key: string) => String(import.meta.env[key] ?? "").trim();

export const SUPABASE_URL = env("VITE_SUPABASE_URL") || "https://bionetfauvpcwlhqvvum.supabase.co";
const SUPABASE_KEY =
  env("VITE_SUPABASE_PUBLISHABLE_KEY") || "sb_publishable_-i5sd4SRbAKnRxZYfPhI3Q_FwdPGo3_";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});
