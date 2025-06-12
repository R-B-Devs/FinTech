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

run_init_scripts() {
    echo "📜 Running initialization scripts..."

    if [ ! -d "../scripts" ]; then
        echo "Scripts directory not found!"
        exit 1
    fi

    # Sort files to ensure correct order
    for script in ../scripts/[0-9][0-9]-*.sql; do
    echo
    echo "/////////////////////////////////////////////////"
    echo $script
    echo "/////////////////////////////////////////////////"
        if [ -f "$script" ]; then
            echo "Running script: $(basename "$script")"
            PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -d "$DB_NAME" -f "$script" || {
                echo "Failed to run $script"
                exit 1
            }
            echo "Successfully executed: $(basename "$script")"
        fi
    done

    echo "✨ All initialization scripts completed successfully!"
}

# OS-specific setup
case "$OSTYPE" in
    "darwin"*) # macOS
        echo "Setting up for macOS..."
        
        # Check if running as root
        if [ "$EUID" -eq 0 ]; then
            echo "Please run this script as a non-root user"
            exit 1
        fi
        
        if ! check_postgres; then
            echo "Installing PostgreSQL..."
            brew install postgresql@15
            brew link postgresql@15 --force
        fi
        
        # Stop existing PostgreSQL processes
        echo "Stopping any running PostgreSQL instances..."
        brew services stop postgresql@15 2>/dev/null || true
        pkill postgres 2>/dev/null || true
        
        # Use proper PostgreSQL data directory
        PGDATA="$(brew --prefix)/var/postgresql@15"
        
        # Clean up and reinitialize if needed
        if [ -d "$PGDATA" ]; then
            echo "🧹 Cleaning up existing PostgreSQL data directory..."
            rm -rf "$PGDATA"
        fi
        
        echo "Initializing fresh PostgreSQL data directory..."
        mkdir -p "$PGDATA"
        chmod 700 "$PGDATA"
        initdb "$PGDATA" --auth=trust --no-locale --encoding=UTF8
        
        # Start PostgreSQL manually
        echo "Starting PostgreSQL manually..."
        pg_ctl -D "$PGDATA" -l "$PGDATA/server.log" start
        
        # Wait for PostgreSQL to be ready
        echo "⏳ Waiting for PostgreSQL to start..."
        for i in {1..30}; do
            if pg_isready -q; then
                echo "PostgreSQL is ready!"
                break
            fi
            if [ $i -eq 30 ]; then
                echo "PostgreSQL failed to start. Check logs at $PGDATA/server.log"
                exit 1
            fi
            sleep 1
        done
        
        # Create superuser if it doesn't exist
        echo "Creating postgres superuser..."
        createuser -s postgres || true
        
        # Set password for postgres user
        psql -U postgres -c "ALTER USER postgres WITH PASSWORD '$DB_PASSWORD';" || true
        
        # Create database and run initialization
        echo "Creating database..."
        if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
            createdb -U postgres "$DB_NAME"
            echo "Database $DB_NAME created successfully"
            run_init_scripts
        else
            echo "Database $DB_NAME already exists"
        fi
        ;;

    "linux-gnu"*)
        echo "Setting up for Linux..."
        if ! check_postgres; then
            echo "Please install PostgreSQL first"
            exit 1
        fi
        
        # Check if service is running
        if ! systemctl is-active --quiet postgresql; then
            echo "Starting PostgreSQL service..."
            sudo systemctl start postgresql
            sleep 3
        fi
        
        create_database
        ;;
        
    "msys"*|"cygwin"*)
        echo "🪟 Setting up for Windows..."

        # Check for PostgreSQL tools
        if ! command -v psql &> /dev/null || ! command -v pg_ctl &> /dev/null; then
            echo "Please ensure PostgreSQL (psql and pg_ctl) is installed and in your PATH."
            exit 1
        fi

        # Set default PGDATA if not set
        if [ -z "$PGDATA" ]; then
            PGDATA="/c/Program Files/PostgreSQL/15/data"
        fi

        # Check if PGDATA exists
        if [ ! -d "$PGDATA" ]; then
            echo "PostgreSQL data directory not found at $PGDATA"
            echo "Please initialize your database cluster first (e.g., using initdb)."
            exit 1
        fi

        # Start PostgreSQL if not running
        if ! pg_ctl status -D "$PGDATA" | grep -q "server is running"; then
            echo "Starting PostgreSQL service..."
            pg_ctl -D "$PGDATA" -l "$PGDATA/server.log" start
            sleep 3
        fi

        # Wait for PostgreSQL to be ready
        echo "Waiting for PostgreSQL to be ready..."
        for i in {1..30}; do
            if pg_isready -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
                echo "PostgreSQL is ready!"
                break
            fi
            if [ $i -eq 30 ]; then
                echo "PostgreSQL failed to start. Check logs at $PGDATA/server.log"
                exit 1
            fi
            sleep 1
        done

        # Create database and run initialization
        echo "📦 Creating database..."
        if ! psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
            createdb -U "$DB_USER" "$DB_NAME"
            echo "Database $DB_NAME created successfully"
        else
            echo "Database $DB_NAME already exists"
        fi

        run_init_scripts
        ;;
        
    *)
        echo "Unsupported operating system: $OSTYPE"
        exit 1
        ;;
esac

# # Run initialization scripts
# echo "Running database initialization scripts..."
# for script in ./sql/*.sql; do
#     if [ -f "$script" ]; then
#         echo "Running $script..."
#         psql -d "$DB_NAME" -f "$script" || {
#             echo "Failed to run $script"
#             exit 1
#         }
#     fi
# done

# Verify database connection
echo "Verifying database connection..."
if psql -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
    echo "Database setup completed successfully"
else
    echo "Database connection verification failed"
    exit 1
fi

# Set database configuration
export PGHOST=${PGHOST:-"localhost"}
export PGPORT=${PGPORT:-"5432"}
export PGUSER=$DB_USER
export PGPASSWORD=$DB_PASSWORD
export PGDATABASE=$DB_NAME

echo "
Setup complete!
Database: $DB_NAME
Host: $PGHOST
Port: $PGPORT
User: $PGUSER
"