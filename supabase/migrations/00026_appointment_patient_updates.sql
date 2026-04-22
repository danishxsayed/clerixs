-- Add new demographic fields to patients
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS blood_group TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

-- Drop end_time from appointments (no longer used)
ALTER TABLE public.appointments 
DROP COLUMN IF EXISTS end_time;
