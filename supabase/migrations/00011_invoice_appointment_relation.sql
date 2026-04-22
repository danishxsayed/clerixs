-- Add appointment_id to invoices table
ALTER TABLE invoices
ADD COLUMN appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL;

-- Create an index to speed up dashboard queries
CREATE INDEX IF NOT EXISTS idx_invoices_appointment_id ON invoices(appointment_id);
