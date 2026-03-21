-- Migration: Change default currency from KES to USD across all tables

-- Update default currency on payment_references
ALTER TABLE payment_references ALTER COLUMN currency SET DEFAULT 'USD';

-- Update default currency on receipts
ALTER TABLE receipts ALTER COLUMN currency SET DEFAULT 'USD';

-- Update default currency on teacher_payouts
ALTER TABLE teacher_payouts ALTER COLUMN currency SET DEFAULT 'USD';

-- Update existing KES records to USD
UPDATE payment_references SET currency = 'USD' WHERE currency = 'KES';
UPDATE receipts SET currency = 'USD' WHERE currency = 'KES';
UPDATE teacher_payouts SET currency = 'USD' WHERE currency = 'KES';
UPDATE wallets SET currency = 'USD' WHERE currency = 'KES';
