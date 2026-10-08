// Links que mudam sem mexer no código: vêm das variáveis VITE_* (arquivo .env ou painel da hospedagem).
// Vazio = o item não aparece. Nenhum botão sem destino real.

const env = (key: string) => String(import.meta.env[key] ?? "").trim();

export const config = {
  supportWhatsapp: env("VITE_SUPPORT_WHATSAPP").replace(/\D/g, ""),
  /** Checkout da Payt do Reset Emocional do Ex (upsell #01). Vazio = sem botão de compra. */
  resetCheckoutUrl: env("VITE_RESET_CHECKOUT_URL"),
};

export const whatsappLink = (message: string) =>
  config.supportWhatsapp
    ? `https://wa.me/${config.supportWhatsapp}?text=${encodeURIComponent(message)}`
    : "";

/** Link do checkout com o e-mail da cliente em ?email= (ajuda a Payt a preencher o formulário). */
export const checkoutLink = (url: string, email: string) => {
  if (!url) return "";
  try {
    const link = new URL(url);
    if (email) link.searchParams.set("email", email);
    return link.toString();
  } catch {
    return "";
  }
};
