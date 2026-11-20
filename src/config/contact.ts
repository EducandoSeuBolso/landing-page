export const WHATSAPP_NUMBER = "5531999189537";
export const WHATSAPP_DISPLAY = "(31) 99918-9537";
export const DIAGNOSTICO_PATH = "/diagnostico";
export const PRIVACY_POLICY_URL =
  "https://educandoseubolso.blog.br/politica-de-privacidade";

export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
