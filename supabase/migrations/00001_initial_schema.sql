-- Initial Schema for Clerixs SaaS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('org_owner', 'doctor', 'receptionist');
CREATE TYPE membership_status AS ENUM ('invited', 'active', 'disabled');
CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE file_category AS ENUM ('xray', 'report', 'prescription', 'consent_form', 'photo', 'other');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE visit_type AS ENUM ('consultation', 'follow_up', 'treatment', 'emergency');
CREATE TYPE appointment_source AS ENUM ('manual', 'online', 'imported');
CREATE TYPE appointment_event_type AS ENUM ('created', 'rescheduled', 'cancelled', 'status_changed', 'reminder_sent');
CREATE TYPE treatment_status AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE clinical_note_type AS ENUM ('consultation', 'progress', 'discharge', 'general');
CREATE TYPE invoice_status AS ENUM ('draft', 'issued', 'partially_paid', 'paid', 'void');
CREATE TYPE payment_method AS ENUM ('cash', 'upi', 'card', 'bank_transfer', 'razorpay', 'other');
CREATE TYPE notification_channel AS ENUM ('sms', 'whatsapp', 'email');
CREATE TYPE notification_status AS ENUM ('queued', 'sent', 'delivered', 'failed', 'cancelled');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'paused', 'cancelled', 'expired');
CREATE TYPE subscription_event_status AS ENUM ('received', 'processed', 'failed');


-- 1. Identity and Tenant Tables
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    default_organization_id UUID, -- Will be foreign key explicitly after organizations is created
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_profile_id UUID NOT NULL REFERENCES profiles(id),
    subscription_status subscription_status DEFAULT 'trialing' NOT NULL,
    plan_code TEXT DEFAULT 'starter' NOT NULL,
    timezone TEXT DEFAULT 'Asia/Kolkata' NOT NULL,
    currency TEXT DEFAULT 'INR' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add fk constraints that require organizations table
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_default_org FOREIGN KEY (default_organization_id) REFERENCES organizations(id);

CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    phone TEXT,
    email TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    gstin TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE organization_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    status membership_status DEFAULT 'active' NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id, profile_id)
);

CREATE TABLE branch_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_membership_id UUID NOT NULL REFERENCES organization_memberships(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE NOT NULL,
    UNIQUE(organization_membership_id, branch_id)
);

CREATE TABLE staff_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role NOT NULL,
    branch_ids UUID[] NOT NULL DEFAULT '{}',
    invite_token_hash TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES profiles(id),
    UNIQUE(organization_id, email)
);

-- 2. Patient Tables
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    primary_branch_id UUID REFERENCES branches(id),
    patient_code TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    date_of_birth DATE,
    age_snapshot INTEGER,
    gender gender_enum,
    address TEXT,
    occupation TEXT,
    referred_by TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    medical_alerts TEXT,
    allergies TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id, patient_code)
);

CREATE TABLE patient_medical_histories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    diabetes BOOLEAN DEFAULT FALSE,
    hypertension BOOLEAN DEFAULT FALSE,
    heart_condition BOOLEAN DEFAULT FALSE,
    pregnancy_status BOOLEAN DEFAULT FALSE,
    current_medications TEXT,
    past_surgeries TEXT,
    habits TEXT,
    additional_notes TEXT,
    recorded_by UUID REFERENCES profiles(id),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(patient_id)
);

CREATE TABLE patient_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    storage_bucket TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size_bytes BIGINT,
    category file_category DEFAULT 'other' NOT NULL,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Appointment Tables
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_membership_id UUID REFERENCES organization_memberships(id),
    created_by_membership_id UUID REFERENCES organization_memberships(id),
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status appointment_status DEFAULT 'scheduled' NOT NULL,
    visit_type visit_type DEFAULT 'consultation' NOT NULL,
    chief_complaint TEXT,
    notes TEXT,
    cancellation_reason TEXT,
    reminder_status TEXT,
    source appointment_source DEFAULT 'manual' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE appointment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    event_type appointment_event_type NOT NULL,
    old_value JSONB,
    new_value JSONB,
    actor_profile_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Clinical Tables
CREATE TABLE treatments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    doctor_membership_id UUID REFERENCES organization_memberships(id),
    title TEXT NOT NULL,
    tooth_numbers TEXT[],
    diagnosis TEXT,
    notes TEXT,
    status treatment_status DEFAULT 'planned' NOT NULL,
    estimated_cost NUMERIC(12, 2),
    final_cost NUMERIC(12, 2),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE treatment_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
    procedure_code TEXT,
    procedure_name TEXT NOT NULL,
    qty INTEGER DEFAULT 1 NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    line_total NUMERIC(12, 2) NOT NULL
);

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment_id UUID REFERENCES treatments(id),
    doctor_membership_id UUID REFERENCES organization_memberships(id),
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration_days INTEGER NOT NULL,
    notes TEXT
);

CREATE TABLE clinical_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment_id UUID REFERENCES treatments(id),
    author_membership_id UUID REFERENCES organization_memberships(id),
    note_type clinical_note_type DEFAULT 'general' NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. Billing Tables
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    treatment_id UUID REFERENCES treatments(id),
    invoice_number TEXT NOT NULL,
    status invoice_status DEFAULT 'draft' NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE,
    subtotal NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL,
    amount_paid NUMERIC(12, 2) DEFAULT 0,
    balance_due NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    pdf_storage_path TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id, invoice_number)
);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    tax_percent NUMERIC(5, 2) DEFAULT 0,
    line_total NUMERIC(12, 2) NOT NULL
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_date DATE NOT NULL,
    reference_number TEXT,
    notes TEXT,
    received_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. Notification Tables
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    channel notification_channel NOT NULL,
    template_key TEXT NOT NULL,
    language_code TEXT DEFAULT 'en' NOT NULL,
    content TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id, channel, template_key, language_code)
);

CREATE TABLE notification_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    channel notification_channel NOT NULL,
    template_key TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    status notification_status DEFAULT 'queued' NOT NULL,
    provider_message_id TEXT,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. Subscription and Billing Control Tables
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    monthly_price NUMERIC(12, 2) NOT NULL,
    yearly_price NUMERIC(12, 2) NOT NULL,
    max_branches INTEGER NOT NULL,
    max_staff INTEGER NOT NULL,
    max_monthly_appointments INTEGER NOT NULL,
    features JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE organization_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    provider TEXT DEFAULT 'razorpay' NOT NULL,
    razorpay_plan_id TEXT,
    razorpay_subscription_id TEXT,
    status subscription_status DEFAULT 'trialing' NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(organization_id)
);

CREATE TABLE subscription_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    organization_subscription_id UUID REFERENCES organization_subscriptions(id),
    event_type TEXT NOT NULL,
    provider_event_id TEXT,
    payload JSONB NOT NULL DEFAULT '{}',
    processed_at TIMESTAMP WITH TIME ZONE,
    status subscription_event_status DEFAULT 'received' NOT NULL
);

-- 8. Analytics and Audit Tables
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id),
    actor_profile_id UUID REFERENCES profiles(id),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    appointments_total INTEGER DEFAULT 0,
    appointments_completed INTEGER DEFAULT 0,
    new_patients INTEGER DEFAULT 0,
    treatments_completed INTEGER DEFAULT 0,
    revenue_collected NUMERIC(12, 2) DEFAULT 0,
    UNIQUE(organization_id, branch_id, metric_date)
);

-- 9. Indexing
CREATE INDEX idx_profiles_default_org ON profiles(default_organization_id);

CREATE INDEX idx_organizations_owner ON organizations(owner_profile_id);

CREATE INDEX idx_branches_org ON branches(organization_id);

CREATE INDEX idx_org_memberships_org ON organization_memberships(organization_id);
CREATE INDEX idx_org_memberships_profile ON organization_memberships(profile_id);

CREATE INDEX idx_branch_memberships_org_mem ON branch_memberships(organization_membership_id);
CREATE INDEX idx_branch_memberships_branch ON branch_memberships(branch_id);

CREATE INDEX idx_staff_invites_org ON staff_invites(organization_id);

CREATE INDEX idx_patients_org ON patients(organization_id);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_code ON patients(patient_code);

CREATE INDEX idx_patient_files_org ON patient_files(organization_id);
CREATE INDEX idx_patient_files_patient_created ON patient_files(patient_id, created_at DESC);

CREATE INDEX idx_appointments_org ON appointments(organization_id);
CREATE INDEX idx_appointments_branch_date_time ON appointments(branch_id, appointment_date, start_time);
CREATE INDEX idx_appointments_status ON appointments(status);

CREATE INDEX idx_treatments_org ON treatments(organization_id);
CREATE INDEX idx_treatments_patient_created ON treatments(patient_id, created_at DESC);

CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_patient_created ON invoices(patient_id, created_at DESC);
CREATE INDEX idx_invoices_status ON invoices(status);

CREATE INDEX idx_notification_jobs_scheduled_status ON notification_jobs(scheduled_for, status);

CREATE INDEX idx_daily_metrics_org_date ON daily_metrics(organization_id, metric_date);

-- Functions
-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER set_timestamp_profiles
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_organizations
BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_branches
BEFORE UPDATE ON branches
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_patients
BEFORE UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_appointments
BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_treatments
BEFORE UPDATE ON treatments
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_invoices
BEFORE UPDATE ON invoices
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_notification_templates
BEFORE UPDATE ON notification_templates
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_notification_jobs
BEFORE UPDATE ON notification_jobs
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_timestamp_organization_subscriptions
BEFORE UPDATE ON organization_subscriptions
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
