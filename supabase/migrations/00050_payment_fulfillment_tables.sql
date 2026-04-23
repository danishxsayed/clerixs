-- Add tables for robust payment fulfillment and billing history
CREATE TABLE IF NOT EXISTS pending_orders (
    order_id TEXT PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    interval TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS subscription_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    amount_paid NUMERIC(12, 2) NOT NULL,
    billing_cycle TEXT NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    cashfree_order_id TEXT UNIQUE,
    status TEXT DEFAULT 'paid' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE pending_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage pending orders" ON pending_orders 
    FOR ALL USING (true); -- Use admin client for this

CREATE POLICY "Users can view their own subscription invoices" ON subscription_invoices 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_memberships
            WHERE organization_id = subscription_invoices.organization_id 
            AND profile_id = auth.uid()
        )
    );

