import { config } from "@/lib/config";

// Pedido de acesso ao Reset Emocional do Ex pelo WhatsApp, para quem ainda não comprou.
// Número: VITE_RESET_WHATSAPP; se vazio, usa o do suporte (VITE_SUPPORT_WHATSAPP).

const env = (key: string) => String(import.meta.env[key] ?? "").trim();

const number = () => env("VITE_RESET_WHATSAPP").replace(/\D/g, "") || config.supportWhatsapp;

export function resetAccessLink(email: string) {
  const phone = number();
  if (!phone) return "";
  const message = [
    "Olá! Quero liberar o acesso ao Reset Emocional do Ex no app Código da Reconquista.",
    email ? `Meu e-mail de acesso é ${email}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/** Com a compra, abre o módulo. Sem a compra, abre o WhatsApp com a mensagem pronta; se não houver
 * número configurado, abre a tela do produto (que explica como liberar), nunca um link quebrado. */
export function openResetOrRequest(owned: boolean, email: string, openReset: () => void) {
  if (owned) return openReset();
  const link = resetAccessLink(email);
  if (link) window.open(link, "_blank", "noopener");
  else openReset();
}
