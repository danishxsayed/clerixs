-- 1. Enums
CREATE TYPE lab_order_status AS ENUM ('draft', 'ordered', 'sample_collected', 'processing', 'completed', 'cancelled');

-- 2. Catalog Tables
CREATE TABLE lab_test_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id, name)
);

CREATE TABLE lab_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES lab_test_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE lab_test_parameters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_test_id UUID NOT NULL REFERENCES lab_tests(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit TEXT,
    reference_range_min NUMERIC(10, 3),
    reference_range_max NUMERIC(10, 3),
    expected_string_value TEXT,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE lab_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE lab_package_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES lab_packages(id) ON DELETE CASCADE,
    lab_test_id UUID NOT NULL REFERENCES lab_tests(id) ON DELETE CASCADE,
    UNIQUE(package_id, lab_test_id)
);

-- 3. Order Tables
CREATE TABLE lab_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    doctor_membership_id UUID REFERENCES organization_memberships(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    status lab_order_status DEFAULT 'ordered' NOT NULL,
    total_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
    notes TEXT,
    created_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE lab_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
    lab_test_id UUID REFERENCES lab_tests(id) ON DELETE SET NULL,
    lab_package_id UUID REFERENCES lab_packages(id) ON DELETE SET NULL,
    price NUMERIC(12, 2) DEFAULT 0 NOT NULL
);

CREATE TABLE lab_samples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
    sample_type TEXT NOT NULL,
    barcode TEXT,
    collected_at TIMESTAMP WITH TIME ZONE,
    collected_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
    lab_test_id UUID NOT NULL REFERENCES lab_tests(id) ON DELETE CASCADE,
    lab_test_parameter_id UUID NOT NULL REFERENCES lab_test_parameters(id) ON DELETE CASCADE,
    result_value TEXT,
    is_abnormal BOOLEAN DEFAULT FALSE NOT NULL,
    entered_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    entered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(lab_order_id, lab_test_parameter_id)
);

CREATE TABLE lab_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lab_order_id UUID NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    uploaded_by_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexing
CREATE INDEX idx_lab_tests_org ON lab_tests(organization_id);
CREATE INDEX idx_lab_packages_org ON lab_packages(organization_id);
CREATE INDEX idx_lab_orders_org ON lab_orders(organization_id);
CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX idx_lab_orders_status ON lab_orders(status);

-- Updated_at triggers
CREATE TRIGGER set_timestamp_lab_test_categories BEFORE UPDATE ON lab_test_categories FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER set_timestamp_lab_tests BEFORE UPDATE ON lab_tests FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER set_timestamp_lab_packages BEFORE UPDATE ON lab_packages FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER set_timestamp_lab_orders BEFORE UPDATE ON lab_orders FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER set_timestamp_lab_samples BEFORE UPDATE ON lab_samples FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER set_timestamp_lab_results BEFORE UPDATE ON lab_results FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Enable RLS
ALTER TABLE lab_test_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_test_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_package_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_attachments ENABLE ROW LEVEL SECURITY;

-- 1. Lab Test Categories
CREATE POLICY "Users can view lab_test_categories" ON lab_test_categories FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "Users can insert lab_test_categories" ON lab_test_categories FOR INSERT WITH CHECK (is_org_member(organization_id));
CREATE POLICY "Users can update lab_test_categories" ON lab_test_categories FOR UPDATE USING (is_org_member(organization_id));
CREATE POLICY "Users can delete lab_test_categories" ON lab_test_categories FOR DELETE USING (is_org_member(organization_id));

-- 2. Lab Tests
CREATE POLICY "Users can view lab_tests" ON lab_tests FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "Users can insert lab_tests" ON lab_tests FOR INSERT WITH CHECK (is_org_member(organization_id));
CREATE POLICY "Users can update lab_tests" ON lab_tests FOR UPDATE USING (is_org_member(organization_id));
CREATE POLICY "Users can delete lab_tests" ON lab_tests FOR DELETE USING (is_org_member(organization_id));

-- 3. Lab Test Parameters (RLS checks lab_tests via subquery)
CREATE POLICY "Users can view lab_test_parameters" ON lab_test_parameters FOR SELECT USING (
  EXISTS (SELECT 1 FROM lab_tests WHERE lab_tests.id = lab_test_parameters.lab_test_id AND is_org_member(lab_tests.organization_id))
);
CREATE POLICY "Users can insert lab_test_parameters" ON lab_test_parameters FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM lab_tests WHERE lab_tests.id = lab_test_parameters.lab_test_id AND is_org_member(lab_tests.organization_id))
);
CREATE POLICY "Users can update lab_test_parameters" ON lab_test_parameters FOR UPDATE USING (
  EXISTS (SELECT 1 FROM lab_tests WHERE lab_tests.id = lab_test_parameters.lab_test_id AND is_org_member(lab_tests.organization_id))
);
CREATE POLICY "Users can delete lab_test_parameters" ON lab_test_parameters FOR DELETE USING (
  EXISTS (SELECT 1 FROM lab_tests WHERE lab_tests.id = lab_test_parameters.lab_test_id AND is_org_member(lab_tests.organization_id))
);

-- 4. Lab Packages
CREATE POLICY "Users can view lab_packages" ON lab_packages FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "Users can insert lab_packages" ON lab_packages FOR INSERT WITH CHECK (is_org_member(organization_id));
CREATE POLICY "Users can update lab_packages" ON lab_packages FOR UPDATE USING (is_org_member(organization_id));
CREATE POLICY "Users can delete lab_packages" ON lab_packages FOR DELETE USING (is_org_member(organization_id));

-- 5. Lab Package Tests
CREATE POLICY "Users can view lab_package_tests" ON lab_package_tests FOR SELECT USING (
  EXISTS (SELECT 1 FROM lab_packages WHERE lab_packages.id = lab_package_tests.package_id AND is_org_member(lab_packages.organization_id))
);
CREATE POLICY "Users can insert lab_package_tests" ON lab_package_tests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM lab_packages WHERE lab_packages.id = lab_package_tests.package_id AND is_org_member(lab_packages.organization_id))
);
CREATE POLICY "Users can delete lab_package_tests" ON lab_package_tests FOR DELETE USING (
  EXISTS (SELECT 1 FROM lab_packages WHERE lab_packages.id = lab_package_tests.package_id AND is_org_member(lab_packages.organization_id))
);

-- 6. Lab Orders
CREATE POLICY "Users can view lab_orders" ON lab_orders FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "Users can insert lab_orders" ON lab_orders FOR INSERT WITH CHECK (is_org_member(organization_id));
CREATE POLICY "Users can update lab_orders" ON lab_orders FOR UPDATE USING (is_org_member(organization_id));
CREATE POLICY "Users can delete lab_orders" ON lab_orders FOR DELETE USING (is_org_member(organization_id));

-- 7. Lab Order Items
CREATE POLICY "Users can view lab_order_items" ON lab_order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM lab_orders WHERE lab_orders.id = lab_order_items.lab_order_id AND is_org_member(lab_orders.organization_id))
);
CREATE POLICY "Users can insert lab_order_items" ON lab_order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM lab_orders WHERE lab_orders.id = lab_order_items.lab_order_id AND is_org_member(lab_orders.organization_id))
);
CREATE POLICY "Users can delete lab_order_items" ON lab_order_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM lab_orders WHERE lab_orders.id = lab_order_items.lab_order_id AND is_org_member(lab_orders.organization_id))
);

-- 8. Lab Samples
CREATE POLICY "Users can view lab_samples" ON lab_samples FOR SELECT USING (
  EXISTS (SELECT 1 FROM lab_orders WHERE lab_orders.id = lab_samples.lab_order_id AND is_org_member(lab_orders.organization_id))
);
CREATE POLICY "Users can insert lab_samples" ON lab_samples FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM lab_orders WHERE lab_orders.id = lab_samples.lab_order_id AND is_org_member(lab_orders.organization_id))
);
CREATE POLICY "Users can update lab_samples" ON lab_samples FOR UPDATE USING (
  EXISTS (SELECT 1 FROM lab_orders WHERE lab_orders.id = lab_samples.lab_order_id AND is_org_member(lab_orders.organization_id))
);
CREATE POLICY "Users can delete lab_samples" ON lab_samples FOR DELETE USING (
  EXISTS (SELECT 1 FROM lab_orders WHERE lab_orders.id = lab_samples.lab_order_id AND is_org_member(lab_orders.organization_id))
);

-- 9. Lab Results
CREATE POLICY "Users can view lab_results" ON lab_results FOR SELECT USING (
  EXISTS (SELECT 1 FROM lab_orders WHERE lab_orders.id = lab_results.lab_order_id AND is_org_member(lab_orders.organization_id))
);
CREATE POLICY "Users can insert lab_results" ON lab_results FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM lab_orders WHERE lab_orders.id = lab_results.lab_order_id AND is_org_member(lab_orders.organization_id))
);
CREATE POLICY "Users can update lab_results" ON lab_results FOR UPDATE USING (
  EXISTS (SELECT 1 FROM lab_orders WHERE lab_orders.id = lab_results.lab_order_id AND is_org_member(lab_orders.organization_id))
);

-- 10. Lab Attachments
CREATE POLICY "Users can view lab_attachments" ON lab_attachments FOR SELECT USING (
  EXISTS (SELECT 1 FROM lab_orders WHERE lab_orders.id = lab_attachments.lab_order_id AND is_org_member(lab_orders.organization_id))
);
CREATE POLICY "Users can insert lab_attachments" ON lab_attachments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM lab_orders WHERE lab_orders.id = lab_attachments.lab_order_id AND is_org_member(lab_orders.organization_id))
);
CREATE POLICY "Users can delete lab_attachments" ON lab_attachments FOR DELETE USING (
  EXISTS (SELECT 1 FROM lab_orders WHERE lab_orders.id = lab_attachments.lab_order_id AND is_org_member(lab_orders.organization_id))
);
