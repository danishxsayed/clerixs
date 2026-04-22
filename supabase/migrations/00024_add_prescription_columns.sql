-- 00024_add_prescription_columns.sql
-- Add the diagnosis column to the dormant prescriptions table

ALTER TABLE public.prescriptions 
ADD COLUMN diagnosis TEXT;
