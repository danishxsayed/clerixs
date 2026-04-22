-- Add last_used_at column to prescription_templates
ALTER TABLE public.prescription_templates ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;

-- Update existing records to have last_used_at match created_at
UPDATE public.prescription_templates SET last_used_at = created_at WHERE last_used_at IS NULL;
