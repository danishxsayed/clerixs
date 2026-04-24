
-- Queue Management System for Clerixs

-- 1. Create the queue_entries table
CREATE TYPE queue_status AS ENUM ('waiting', 'in_consultation', 'completed', 'skipped');

CREATE TABLE queue_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    doctor_membership_id UUID NOT NULL REFERENCES organization_memberships(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    patient_name TEXT, -- For walk-ins without patient profile
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    status queue_status DEFAULT 'waiting' NOT NULL,
    queue_position INTEGER NOT NULL,
    is_walkin BOOLEAN DEFAULT FALSE NOT NULL,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    called_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE queue_entries;

-- 3. Enable RLS
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Users can view queue entries of their organization" 
    ON queue_entries FOR SELECT 
    USING (organization_id IN (
        SELECT organization_id FROM organization_memberships WHERE profile_id = auth.uid()
    ));

CREATE POLICY "Users can insert queue entries for their organization" 
    ON queue_entries FOR INSERT 
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM organization_memberships WHERE profile_id = auth.uid()
    ));

CREATE POLICY "Users can update queue entries of their organization" 
    ON queue_entries FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM organization_memberships WHERE profile_id = auth.uid()
    ));

CREATE POLICY "Users can delete queue entries of their organization" 
    ON queue_entries FOR DELETE 
    USING (organization_id IN (
        SELECT organization_id FROM organization_memberships WHERE profile_id = auth.uid()
    ));

-- 5. Updated_at trigger
CREATE TRIGGER set_timestamp_queue_entries
    BEFORE UPDATE ON queue_entries
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- 6. Indexes for performance
CREATE INDEX idx_queue_entries_org ON queue_entries(organization_id);
CREATE INDEX idx_queue_entries_doctor ON queue_entries(doctor_membership_id);
CREATE INDEX idx_queue_entries_status ON queue_entries(status);
CREATE INDEX idx_queue_entries_created_at ON queue_entries(created_at);

-- 7. Automated Daily Reset (Archive) Procedure
-- This resets positions for the next day and marks anything left as completed.
CREATE OR REPLACE FUNCTION archive_daily_queue()
RETURNS void AS $$
BEGIN
    UPDATE queue_entries 
    SET status = 'completed', 
        completed_at = NOW() 
    WHERE status IN ('waiting', 'in_consultation')
    AND created_at < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 8. Schedule the reset at midnight (requires pg_cron enabled in dashboard)
-- SELECT cron.schedule('0 0 * * *', 'SELECT archive_daily_queue()');
-- Note: User may need to enable pg_cron in the Supabase Extensions dashboard.
