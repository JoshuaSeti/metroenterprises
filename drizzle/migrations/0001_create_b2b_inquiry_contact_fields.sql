ALTER TABLE public.b2b_inquiries ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE public.b2b_inquiries ADD COLUMN IF NOT EXISTS contact_email TEXT;

COMMENT ON COLUMN public.b2b_inquiries.whatsapp_number IS 'Optional-required buyer WhatsApp contact captured on the inquiry form';
COMMENT ON COLUMN public.b2b_inquiries.contact_email IS 'Optional email address captured on the inquiry form';