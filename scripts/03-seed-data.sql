-- Connect to the database
\c fintech_db

-- Insert initial users (WITHOUT passwords - they'll register later)
INSERT INTO users (account_number, id_number, first_name, last_name, email, phone, is_active) VALUES
('ACC001234567890', '9001010001080', 'John', 'Doe', 'john.doe@email.com', '+27123456789', FALSE),
('ACC002345678901', '8505050002084', 'Jane', 'Smith', 'jane.smith@email.com', '+27234567890', FALSE),
('ACC003456789012', '7712120003088', 'Michael', 'Johnson', 'michael.johnson@email.com', '+27345678901', FALSE),
('ACC004567890123', '9203030004082', 'Sarah', 'Williams', 'sarah.williams@email.com', '+27456789012', FALSE),
('ACC005678901234', '8801010005086', 'David', 'Brown', 'david.brown@email.com', '+27567890123', FALSE),
('ACC006789012345', '9506060006080', 'Lisa', 'Davis', 'lisa.davis@email.com', '+27678901234', FALSE),
('ACC007890123456', '8109090007084', 'Robert', 'Miller', 'robert.miller@email.com', '+27789012345', FALSE),
('ACC008901234567', '9404040008088', 'Emily', 'Wilson', 'emily.wilson@email.com', '+27890123456', FALSE),
('ACC009012345678', '8702020009082', 'James', 'Moore', 'james.moore@email.com', '+27901234567', FALSE),
('ACC010123456789', '9008080010086', 'Amanda', 'Taylor', 'amanda.taylor@email.com', '+27012345678', FALSE);

-- Insert accounts for each user
INSERT INTO accounts (user_id, account_type, balance, credit_limit, interest_rate) 
SELECT 
    u.user_id,
    'CHEQUE',
    CASE 
        WHEN u.account_number = 'ACC001234567890' THEN 15420.50
        WHEN u.account_number = 'ACC002345678901' THEN 8750.25
        WHEN u.account_number = 'ACC003456789012' THEN 23150.75
        WHEN u.account_number = 'ACC004567890123' THEN 5280.10
        WHEN u.account_number = 'ACC005678901234' THEN 31250.80
        WHEN u.account_number = 'ACC006789012345' THEN 12980.45
        WHEN u.account_number = 'ACC007890123456' THEN 45670.30
        WHEN u.account_number = 'ACC008901234567' THEN 9840.60
        WHEN u.account_number = 'ACC009012345678' THEN 18750.90
        WHEN u.account_number = 'ACC010123456789' THEN 27350.20
    END,
    0.00,
    0.0125
FROM users u;

-- Insert savings accounts for some users
INSERT INTO accounts (user_id, account_type, balance, credit_limit, interest_rate) 
SELECT 
    u.user_id,
    'SAVINGS',
    CASE 
        WHEN u.account_number = 'ACC001234567890' THEN 50000.00
        WHEN u.account_number = 'ACC003456789012' THEN 75000.00
        WHEN u.account_number = 'ACC005678901234' THEN 120000.00
        WHEN u.account_number = 'ACC007890123456' THEN 200000.00
        WHEN u.account_number = 'ACC010123456789' THEN 85000.00
    END,
    0.00,
    0.0425
FROM users u
WHERE u.account_number IN ('ACC001234567890', 'ACC003456789012', 'ACC005678901234', 'ACC007890123456', 'ACC010123456789');

-- Insert credit card accounts for some users
INSERT INTO accounts (user_id, account_type, balance, credit_limit, interest_rate) 
SELECT 
    u.user_id,
    'CREDIT_CARD',
    CASE 
        WHEN u.account_number = 'ACC002345678901' THEN -2450.50
        WHEN u.account_number = 'ACC004567890123' THEN -1800.25
        WHEN u.account_number = 'ACC006789012345' THEN -5670.80
        WHEN u.account_number = 'ACC008901234567' THEN -890.40
        WHEN u.account_number = 'ACC009012345678' THEN -3250.60
    END,
    CASE 
        WHEN u.account_number = 'ACC002345678901' THEN 15000.00
        WHEN u.account_number = 'ACC004567890123' THEN 10000.00
        WHEN u.account_number = 'ACC006789012345' THEN 25000.00
        WHEN u.account_number = 'ACC008901234567' THEN 8000.00
        WHEN u.account_number = 'ACC009012345678' THEN 20000.00
    END,
    0.1995
FROM users u
WHERE u.account_number IN ('ACC002345678901', 'ACC004567890123', 'ACC006789012345', 'ACC008901234567', 'ACC009012345678');

-- Insert sample transactions
INSERT INTO transactions (account_id, transaction_type, amount, description, category, merchant_name, transaction_date, balance_after, location) 
SELECT 
    a.account_id,
    'DEBIT',
    -850.00,
    'Grocery Shopping',
    'GROCERIES',
    'Pick n Pay',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    a.balance - 850.00,
    'Johannesburg, SA'
FROM accounts a 
JOIN users u ON a.user_id = u.user_id 
WHERE u.account_number = 'ACC001234567890' AND a.account_type = 'CHEQUE'
LIMIT 1;

INSERT INTO transactions (account_id, transaction_type, amount, description, category, merchant_name, transaction_date, balance_after, location) 
SELECT 
    a.account_id,
    'CREDIT',
    25000.00,
    'Salary Deposit',
    'INCOME',
    'ABC Company',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    a.balance + 25000.00,
    'Cape Town, SA'
FROM accounts a 
JOIN users u ON a.user_id = u.user_id 
WHERE u.account_number = 'ACC003456789012' AND a.account_type = 'CHEQUE'
LIMIT 1;

-- Insert more sample transactions for different users
INSERT INTO transactions (account_id, transaction_type, amount, description, category, merchant_name, transaction_date, balance_after, location) VALUES
((SELECT a.account_id FROM accounts a JOIN users u ON a.user_id = u.user_id WHERE u.account_number = 'ACC002345678901' AND a.account_type = 'CHEQUE' LIMIT 1), 'DEBIT', -450.00, 'Restaurant', 'DINING', 'Spur Steak Ranch', CURRENT_TIMESTAMP - INTERVAL '3 hours', 8300.25, 'Pretoria, SA'),
((SELECT a.account_id FROM accounts a JOIN users u ON a.user_id = u.user_id WHERE u.account_number = 'ACC004567890123' AND a.account_type = 'CHEQUE' LIMIT 1), 'DEBIT', -1200.00, 'Fuel', 'TRANSPORT', 'Shell Garage', CURRENT_TIMESTAMP - INTERVAL '1 day', 4080.10, 'Durban, SA'),
((SELECT a.account_id FROM accounts a JOIN users u ON a.user_id = u.user_id WHERE u.account_number = 'ACC005678901234' AND a.account_type = 'CHEQUE' LIMIT 1), 'CREDIT', 15000.00, 'Freelance Payment', 'INCOME', 'XYZ Client', CURRENT_TIMESTAMP - INTERVAL '2 days', 46250.80, 'Cape Town, SA');

-- Insert income records
INSERT INTO income (user_id, source, amount, frequency, next_payment_date) 
SELECT 
    u.user_id,
    'Salary - ABC Company',
    25000.00,
    'MONTHLY',
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '24 days'
FROM users u WHERE u.account_number = 'ACC001234567890';

INSERT INTO income (user_id, source, amount, frequency, next_payment_date) 
SELECT 
    u.user_id,
    'Salary - Tech Corp',
    35000.00,
    'MONTHLY',
    DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '29 days'
FROM users u WHERE u.account_number = 'ACC003456789012';

-- Insert credit scores
INSERT INTO credit_scores (user_id, score, factors, recommendations) 
SELECT 
    u.user_id,
    CASE 
        WHEN u.account_number = 'ACC001234567890' THEN 720
        WHEN u.account_number = 'ACC002345678901' THEN 650
        WHEN u.account_number = 'ACC003456789012' THEN 780
        WHEN u.account_number = 'ACC004567890123' THEN 590
        WHEN u.account_number = 'ACC005678901234' THEN 820
    END,
    '{"payment_history": "Good", "credit_utilization": "Medium", "length_of_credit": "Good", "types_of_credit": "Excellent", "new_credit": "Good"}',
    CASE 
        WHEN u.account_number = 'ACC002345678901' THEN 'Reduce credit card balances to improve credit utilization ratio'
        WHEN u.account_number = 'ACC004567890123' THEN 'Make payments on time and reduce overall debt'
        ELSE 'Maintain current good credit habits'
    END
FROM users u 
WHERE u.account_number IN ('ACC001234567890', 'ACC002345678901', 'ACC003456789012', 'ACC004567890123', 'ACC005678901234');

-- Insert some AI conversation samples
INSERT INTO ai_conversations (user_id, message, response, sentiment) 
SELECT 
    u.user_id,
    'What is my current account balance?',
    'Your current cheque account balance is R15,420.50. Would you like to see details of your recent transactions?',
    'NEUTRAL'
FROM users u WHERE u.account_number = 'ACC001234567890';

INSERT INTO ai_conversations (user_id, message, response, sentiment) 
SELECT 
    u.user_id,
    'I want to apply for a personal loan',
    'Based on your credit score of 780 and income history, you may qualify for a personal loan up to R500,000. Would you like me to start the application process?',
    'POSITIVE'
FROM users u WHERE u.account_number = 'ACC003456789012';

-- Update balances after transactions (this is a simplified approach)
UPDATE accounts SET balance = balance - 850.00 
WHERE account_id = (
    SELECT a.account_id FROM accounts a 
    JOIN users u ON a.user_id = u.user_id 
    WHERE u.account_number = 'ACC001234567890' AND a.account_type = 'CHEQUE'
);

COMMIT;

-- Display summary
SELECT 'Data population completed!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_accounts FROM accounts;
SELECT COUNT(*) as total_transactions FROM transactions;