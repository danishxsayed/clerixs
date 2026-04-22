-- 00042_whatsapp_credits_system.sql
-- Description: WhatsApp Credits System tables, policies and seed data

-- 1. WhatsApp Credit Packs (Master Data)
CREATE TABLE IF NOT EXISTS public.whatsapp_credit_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR' NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. WhatsApp Credits (Balance per Clinic)
CREATE TABLE IF NOT EXISTS public.whatsapp_credits (
    organization_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0 NOT NULL,
    total_purchased INTEGER DEFAULT 0 NOT NULL,
    total_used INTEGER DEFAULT 0 NOT NULL,
    low_credit_alert_sent BOOLEAN DEFAULT false NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. WhatsApp Credit Purchases (Transaction History)
CREATE TABLE IF NOT EXISTS public.whatsapp_credit_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    pack_id UUID REFERENCES public.whatsapp_credit_packs(id),
    amount_paid DECIMAL(10, 2) NOT NULL,
    credits_added INTEGER NOT NULL,
    payment_status TEXT DEFAULT 'pending' NOT NULL, -- pending, paid, failed
    cashfree_order_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. WhatsApp Message Logs (Usage Tracking)
CREATE TABLE IF NOT EXISTS public.whatsapp_message_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    sent_by UUID REFERENCES auth.users(id),
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    message_type TEXT DEFAULT 'prescription' NOT NULL,
    reference_id UUID, -- prescription_id
    phone_number TEXT NOT NULL,
    credits_used INTEGER DEFAULT 1 NOT NULL,
    status TEXT DEFAULT 'sent' NOT NULL, -- sent, delivered, failed
    whatsapp_message_id TEXT, -- message id from Meta
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. Seed Credit Packs
INSERT INTO public.whatsapp_credit_packs (name, credits, price, is_popular) VALUES
('Starter', 100, 99.00, false),
('Basic', 500, 449.00, false),
('Popular ⭐', 1000, 799.00, true),
('Pro', 5000, 3499.00, false)
ON CONFLICT DO NOTHING;

-- 6. RLS Policies

-- Enable RLS
ALTER TABLE public.whatsapp_credit_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_credit_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_message_logs ENABLE ROW LEVEL SECURITY;

-- whatsapp_credit_packs: Readable by everyone authenticated
CREATE POLICY "Credit packs are readable by authenticated users" 
ON public.whatsapp_credit_packs FOR SELECT 
TO authenticated 
USING (true);

-- whatsapp_credits: Readable by clinic staff, writeable by system
CREATE POLICY "Clinic staff can view their credit balance" 
ON public.whatsapp_credits FOR SELECT 
TO authenticated 
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_memberships WHERE profile_id = auth.uid()
    )
);

-- whatsapp_credit_purchases: Readable by clinic staff
CREATE POLICY "Clinic staff can view their purchase history" 
ON public.whatsapp_credit_purchases FOR SELECT 
TO authenticated 
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_memberships WHERE profile_id = auth.uid()
    )
);

-- whatsapp_message_logs: Readable by clinic staff, insertable by clinic staff
CREATE POLICY "Clinic staff can view their message logs" 
ON public.whatsapp_message_logs FOR SELECT 
TO authenticated 
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_memberships WHERE profile_id = auth.uid()
    )
);

CREATE POLICY "Clinic staff can insert message logs" 
ON public.whatsapp_message_logs FOR INSERT 
TO authenticated 
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM public.organization_memberships WHERE profile_id = auth.uid()
    )
);

-- 7. Triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_whatsapp_credits_updated_at
    BEFORE UPDATE ON public.whatsapp_credits
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 8. Function to atomically provision credits (to be used by webhook/verification)
CREATE OR REPLACE FUNCTION public.provision_whatsapp_credits(
    target_org_id UUID,
    credits_to_add INTEGER
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.whatsapp_credits (organization_id, balance, total_purchased)
    VALUES (target_org_id, credits_to_add, credits_to_add)
    ON CONFLICT (organization_id)
    DO UPDATE SET 
        balance = public.whatsapp_credits.balance + credits_to_add,
        total_purchased = public.whatsapp_credits.total_purchased + credits_to_add,
        low_credit_alert_sent = CASE 
            WHEN (public.whatsapp_credits.balance + credits_to_add) >= 50 THEN false 
            ELSE public.whatsapp_credits.low_credit_alert_sent 
        END,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
