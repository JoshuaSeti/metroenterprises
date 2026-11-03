// Validates the optional contact details captured on the B2B inquiry form.
// Rule: a WhatsApp number is required, an email address is optional but must
// be well-formed when provided. Returns null when both are acceptable.
export function validateB2BContact(whatsapp: string, email: string): string | null {
  const wa = whatsapp.trim();
  const mail = email.trim();
  if (!wa) return "Add your WhatsApp number so we can reach you";
  if (!/^\+?[0-9\s()-]{9,20}$/.test(wa)) return "That WhatsApp number doesn't look right";
  if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return "Check the email address you entered";
  return null;
}
