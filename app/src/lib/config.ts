// Links que mudam sem mexer no código: vêm das variáveis VITE_* (arquivo .env ou painel da hospedagem).
// Vazio = o item não aparece. Nenhum botão sem destino real.

const env = (key: string) => String(import.meta.env[key] ?? "").trim();

export const config = {
  supportWhatsapp: env("VITE_SUPPORT_WHATSAPP").replace(/\D/g, ""),
};

export const whatsappLink = (message: string) =>
  config.supportWhatsapp
    ? `https://wa.me/${config.supportWhatsapp}?text=${encodeURIComponent(message)}`
    : "";
