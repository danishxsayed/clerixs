ALTER TABLE organization_subscriptions 
ADD COLUMN IF NOT EXISTS auto_renewal_enabled BOOLEAN DEFAULT true;
