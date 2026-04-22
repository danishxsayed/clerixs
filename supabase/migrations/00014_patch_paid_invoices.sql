-- Ad-hoc patch to fix the historical `amount_paid` zeroes
-- Running this via db push ensures it executes with full postgres admin privileges
UPDATE invoices
SET amount_paid = total_amount, balance_due = 0
WHERE status = 'paid' AND amount_paid = 0;
