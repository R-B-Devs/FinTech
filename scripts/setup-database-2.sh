#!/bin/bash
 
echo "🏦 Setting up ABSA Financial Assistant Database - COMPLETE SETUP..."
 
# Start PostgreSQL if not running
sudo systemctl start postgresql
 
# Drop existing database if it exists (for clean setup)
echo "🗑️ Cleaning up existing database..."
sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS fintech_db;
DROP USER IF EXISTS fintech;
EOF
 
# Create database and user
echo "📊 Creating database..."
sudo -u postgres psql << EOF
CREATE DATABASE fintech_db;
CREATE USER fintech WITH PASSWORD 'rnbdev15';
GRANT ALL PRIVILEGES ON DATABASE fintech_db TO fintech;
\q
EOF
 
# Create schema
echo "🏗️ Creating schema..."
sudo -u postgres psql -d fintech_db -f scripts/02-create-schema.sql
 
# Insert fixed initial data
echo "📝 Inserting initial data (FIXED VERSION)..."
sudo -u postgres psql -d fintech_db -f scripts/03-initial-data.sql
 
echo "✅ Database setup completed successfully!"
echo "📊 Sample Data Summary:"
echo "   - 6 Users (including 1 test user: test@absa.co.za / test123)"
echo "   - 6 Accounts with realistic balances"
echo "   - 200+ Transactions across 6 months"  
echo "   - AI conversation history"
echo "   - Credit scores and loan suggestions"
echo "   - Suspicious activity monitoring"
echo ""
echo "🚀 You can now run your application!"