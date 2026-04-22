-- Enable RLS for billing tables if not already done
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing if re-running
DROP POLICY IF EXISTS "Users can view invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete invoices" ON invoices;

DROP POLICY IF EXISTS "Users can view invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can insert invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can update invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Users can delete invoice items" ON invoice_items;

DROP POLICY IF EXISTS "Users can view payments" ON payments;
DROP POLICY IF EXISTS "Users can insert payments" ON payments;
DROP POLICY IF EXISTS "Users can update payments" ON payments;
DROP POLICY IF EXISTS "Users can delete payments" ON payments;

-- Invoices Policies
CREATE POLICY "Users can view invoices" ON invoices FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "Users can insert invoices" ON invoices FOR INSERT WITH CHECK (is_org_member(organization_id));
CREATE POLICY "Users can update invoices" ON invoices FOR UPDATE USING (is_org_member(organization_id));
CREATE POLICY "Users can delete invoices" ON invoices FOR DELETE USING (is_org_member(organization_id));

-- Invoice Items Policies 
CREATE POLICY "Users can view invoice items" ON invoice_items FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "Users can insert invoice items" ON invoice_items FOR INSERT WITH CHECK (is_org_member(organization_id));
CREATE POLICY "Users can update invoice items" ON invoice_items FOR UPDATE USING (is_org_member(organization_id));
CREATE POLICY "Users can delete invoice items" ON invoice_items FOR DELETE USING (is_org_member(organization_id));

-- Payments Policies
CREATE POLICY "Users can view payments" ON payments FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "Users can insert payments" ON payments FOR INSERT WITH CHECK (is_org_member(organization_id));
CREATE POLICY "Users can update payments" ON payments FOR UPDATE USING (is_org_member(organization_id));
CREATE POLICY "Users can delete payments" ON payments FOR DELETE USING (is_org_member(organization_id));
