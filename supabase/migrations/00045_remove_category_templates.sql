-- 00045_remove_category_templates.sql
-- Remove the category column from prescription_templates as requested by user
ALTER TABLE public.prescription_templates DROP COLUMN IF EXISTS category;
