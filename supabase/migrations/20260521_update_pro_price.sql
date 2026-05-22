-- Migration: Update Pro plan monthly price from ₹1,599 to ₹1,999
UPDATE subscription_plans
SET monthly_price = 1999.00,
    yearly_price = 19999.00
WHERE plan_code = 'pro';
