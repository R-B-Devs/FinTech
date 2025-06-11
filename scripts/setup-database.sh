#!/bin/bash
set -e

echo "Starting database setup..."

# Load environment variables
if [ -f ../.env ]; then
    source ../.env
else
    echo "Error: .env file not found"
    exit 1
fi

required_vars=("DB_NAME" "DB_USER" "DB_PASSWORD" "DB_PORT")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: $var is not set in .env file"
        exit 1
    fi
done

check_postgres() {
    if ! command -v psql &> /dev/null; then
        echo "PostgreSQL is not installed"
        return 1
    fi
    return 0
}

# Function to create database
create_database() {
    if ! psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        echo "Creating database: $DB_NAME"
        createdb "$DB_NAME"
    else
        echo "Database $DB_NAME already exists"
    fi
}
