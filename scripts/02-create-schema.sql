-- Connect to the database
\c fintech_db

-- Create tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Updated Users table schema
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_number VARCHAR(20) UNIQUE NOT NULL,
    id_number VARCHAR(13) UNIQUE NOT NULL, -- South African ID number (13 digits)
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password_hash VARCHAR(255), -- Made nullable for initial registration
    salt VARCHAR(255), -- Made nullable
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT FALSE, -- Changed default to FALSE
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP
);

-- Accounts table
CREATE TABLE accounts (
    account_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    account_type VARCHAR(20) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    credit_limit DECIMAL(15,2) DEFAULT 0.00,
    interest_rate DECIMAL(5,4) DEFAULT 0.0000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- Transactions table
CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES accounts(account_id),
    transaction_type VARCHAR(20) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    merchant_name VARCHAR(100),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    balance_after DECIMAL(15,2),
    location VARCHAR(100),
    is_suspicious BOOLEAN DEFAULT FALSE,
    processed_by_cobol BOOLEAN DEFAULT FALSE
);

-- Income table
CREATE TABLE income (
    income_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    source VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- MONTHLY, WEEKLY, YEARLY
    next_payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Credit scores table
CREATE TABLE credit_scores (
    score_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    score INTEGER NOT NULL,
    score_date DATE DEFAULT CURRENT_DATE,
    factors JSONB,
    recommendations TEXT
);

-- Loan consolidation suggestions
CREATE TABLE loan_suggestions (
    suggestion_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    current_loans JSONB,
    suggested_plan JSONB,
    potential_savings DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING'
);

-- AI conversations
CREATE TABLE ai_conversations (
    conversation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    sentiment VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Call logs
CREATE TABLE call_logs (
    call_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    call_type VARCHAR(20) NOT NULL, -- AUDIO, VIDEO
    duration INTEGER, -- in seconds
    status VARCHAR(20) DEFAULT 'INITIATED',
    bank_agent_id UUID,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    recording_url VARCHAR(255),
    notes TEXT
);

-- Suspicious activities
CREATE TABLE suspicious_activities (
    activity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id),
    transaction_id UUID REFERENCES transactions(transaction_id),
    activity_type VARCHAR(50),
    risk_level VARCHAR(20), -- LOW, MEDIUM, HIGH, CRITICAL
    description TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolved_by UUID
);

-- Create indexes for better performance
CREATE INDEX idx_users_account_number ON users(account_number);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_suspicious_activities_user_id ON suspicious_activities(user_id);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);

--------------------------------------------------------------------------------------------------------------

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.accounts (
  account_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  account_type character varying NOT NULL,
  balance numeric DEFAULT 0.00,
  credit_limit numeric DEFAULT 0.00,
  interest_rate numeric DEFAULT 0.0000,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  status character varying DEFAULT 'ACTIVE'::character varying,
  CONSTRAINT accounts_pkey PRIMARY KEY (account_id),
  CONSTRAINT accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.ai_conversations (
  conversation_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  message text NOT NULL,
  response text NOT NULL,
  sentiment character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ai_conversations_pkey PRIMARY KEY (conversation_id),
  CONSTRAINT ai_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.call_logs (
  call_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  call_type character varying NOT NULL,
  duration integer,
  status character varying DEFAULT 'INITIATED'::character varying,
  bank_agent_id uuid,
  started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  ended_at timestamp without time zone,
  recording_url character varying,
  notes text,
  CONSTRAINT call_logs_pkey PRIMARY KEY (call_id),
  CONSTRAINT call_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.credit_scores (
  score_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  score integer NOT NULL,
  score_date date DEFAULT CURRENT_DATE,
  factors jsonb,
  recommendations text,
  CONSTRAINT credit_scores_pkey PRIMARY KEY (score_id),
  CONSTRAINT credit_scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.income (
  income_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  source character varying NOT NULL,
  amount numeric NOT NULL,
  frequency character varying NOT NULL,
  next_payment_date date,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  is_active boolean DEFAULT true,
  CONSTRAINT income_pkey PRIMARY KEY (income_id),
  CONSTRAINT income_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.loan_suggestions (
  suggestion_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  current_loans jsonb,
  suggested_plan jsonb,
  potential_savings numeric,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  status character varying DEFAULT 'PENDING'::character varying,
  CONSTRAINT loan_suggestions_pkey PRIMARY KEY (suggestion_id),
  CONSTRAINT loan_suggestions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id)
);
CREATE TABLE public.suspicious_activities (
  activity_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  transaction_id uuid,
  activity_type character varying,
  risk_level character varying,
  description text,
  detected_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  resolved boolean DEFAULT false,
  resolved_at timestamp without time zone,
  resolved_by uuid,
  CONSTRAINT suspicious_activities_pkey PRIMARY KEY (activity_id),
  CONSTRAINT suspicious_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id),
  CONSTRAINT suspicious_activities_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(transaction_id)
);
CREATE TABLE public.transactions (
  transaction_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  account_id uuid,
  transaction_type character varying NOT NULL,
  amount numeric NOT NULL,
  description text,
  category character varying,
  merchant_name character varying,
  transaction_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  balance_after numeric,
  location character varying,
  is_suspicious boolean DEFAULT false,
  processed_by_cobol boolean DEFAULT false,
  CONSTRAINT transactions_pkey PRIMARY KEY (transaction_id),
  CONSTRAINT transactions_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(account_id)
);
CREATE TABLE public.users (
  user_id uuid NOT NULL DEFAULT uuid_generate_v4(),
  account_number character varying NOT NULL UNIQUE,
  id_number character varying NOT NULL UNIQUE,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  phone character varying,
  password_hash character varying,
  salt character varying,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  is_active boolean DEFAULT false,
  last_login timestamp without time zone,
  failed_login_attempts integer DEFAULT 0,
  account_locked_until timestamp without time zone,
  dob date,
  gender character varying,
  address character varying,
  CONSTRAINT users_pkey PRIMARY KEY (user_id)
);