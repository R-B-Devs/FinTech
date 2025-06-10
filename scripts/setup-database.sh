!#/bin/bash
# This script sets up the database for the application.
set -e
# Check if the database is already set up
if [ -f /var/lib/postgresql/data/PG_VERSION ]; then
    echo "Database already set up."
else
    echo "Setting up the database..."
    # Initialize the database
    pg_ctl initdb -D /var/lib/postgresql/data
    # Start the PostgreSQL server
    pg_ctl start -D /var/lib/postgresql/data
    # Create a new database user and database
    psql -c "CREATE USER myuser WITH PASSWORD 'mypassword';"
    psql -c "CREATE DATABASE mydatabase OWNER myuser;"
    echo "Database setup complete."
fi
# Stop the PostgreSQL server
pg_ctl stop -D /var/lib/postgresql/data
# Ensure the script is executable
chmod +x /scripts/setup-database.sh
# Ensure the script is run with the correct permissions
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root."
    exit 1
fi
# Ensure the PostgreSQL service is running
service postgresql start
# Ensure the database is accessible
psql -U myuser -d mydatabase -c "SELECT 1;" || {
    echo "Database connection failed. Please check the PostgreSQL service."
    exit 1
}
# Ensure the database is ready for use
echo "Database is ready for use."
# Ensure the script is idempotent
if [ -f /var/lib/postgresql/data/PG_VERSION ]; then
    echo "Database is already set up. Skipping setup."
else
    echo "Database setup is required."
    # Call the setup function
    /scripts/setup-database.sh
fi
# Ensure the script is run in the correct environment
if [ -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL is not set. Please set it to connect to the database."
    exit 1
fi
# Ensure the script is run with the correct environment variables
export PGUSER=myuser
export PGPASSWORD=mypassword
export PGDATABASE=mydatabase
# Ensure the script is run with the correct database connection
if [ -z "$PGHOST" ]; then
    export PGHOST=localhost
fi
# Ensure the script is run with the correct database port
if [ -z "$PGPORT" ]; then
    export PGPORT=5432
fi
# Ensure the script is run with the correct database SSL mode
if [ -z "$PGSSLMODE" ]; then
    export PGSSLMODE=disable
fi
# Ensure the script is run with the correct database application name
if [ -z "$PGAPPNAME" ]; then
    export PGAPPNAME=myapp
fi
# Ensure the script is run with the correct database connection timeout
if [ -z "$PGCONNECT_TIMEOUT" ]; then
    export PGCONNECT_TIMEOUT=10
fi
# Ensure the script is run with the correct database statement timeout
if [ -z "$PGSTATEMENT_TIMEOUT" ]; then
    export PGSTATEMENT_TIMEOUT=5000
fi
# Ensure the script is run with the correct database idle timeout
if [ -z "$PGIDLE_TIMEOUT" ]; then
    export PGIDLE_TIMEOUT=60000
fi
# Ensure the script is run with the correct database connection pool size
if [ -z "$PGPOOL_SIZE" ]; then
    export PGPOOL_SIZE=10
fi
# Ensure the script is run with the correct database connection pool timeout
if [ -z "$PGPOOL_TIMEOUT" ]; then
    export PGPOOL_TIMEOUT=30000
fi
# Ensure the script is run with the correct database connection pool idle timeout
if [ -z "$PGPOOL_IDLE_TIMEOUT" ]; then
    export PGPOOL_IDLE_TIMEOUT=60000
fi
# Ensure the script is run with the correct database connection pool max lifetime
if [ -z "$PGPOOL_MAX_LIFETIME" ]; then
    export PGPOOL_MAX_LIFETIME=3600000
fi
# Ensure the script is run with the correct database connection pool max connections
if [ -z "$PGPOOL_MAX_CONNECTIONS" ]; then
    export PGPOOL_MAX_CONNECTIONS=100
fi
# Ensure the script is run with the correct database connection pool min connections
if [ -z "$PGPOOL_MIN_CONNECTIONS" ]; then
    export PGPOOL_MIN_CONNECTIONS=1
fi
# Ensure the script is run with the correct database connection pool max idle connections
if [ -z "$PGPOOL_MAX_IDLE_CONNECTIONS" ]; then
    export PGPOOL_MAX_IDLE_CONNECTIONS=10
fi
# Ensure the script is run with the correct database connection pool max wait time
if [ -z "$PGPOOL_MAX_WAIT_TIME" ]; then
    export PGPOOL_MAX_WAIT_TIME=30000
fi
# Ensure the script is run with the correct database connection pool max retries
if [ -z "$PGPOOL_MAX_RETRIES" ]; then
    export PGPOOL_MAX_RETRIES=3
fi
# Ensure the script is run with the correct database connection pool retry delay
if [ -z "$PGPOOL_RETRY_DELAY" ]; then
    export PGPOOL_RETRY_DELAY=1000
fi
# Ensure the script is run with the correct database connection pool health check
if [ -z "$PGPOOL_HEALTH_CHECK" ]; then
    export PGPOOL_HEALTH_CHECK=1
fi
# Ensure the script is run with the correct database connection pool health check interval
if [ -z "$PGPOOL_HEALTH_CHECK_INTERVAL" ]; then
    export PGPOOL_HEALTH_CHECK_INTERVAL=10000
fi
# Ensure the script is run with the correct database connection pool health check timeout
if [ -z "$PGPOOL_HEALTH_CHECK_TIMEOUT" ]; then
    export PGPOOL_HEALTH_CHECK_TIMEOUT=5000
fi
# Ensure the script is run with the correct database connection pool health check retries
if [ -z "$PGPOOL_HEALTH_CHECK_RETRIES" ]; then
    export PGPOOL_HEALTH_CHECK_RETRIES=3
fi
# Ensure the script is run with the correct database connection pool health check delay
if [ -z "$PGPOOL_HEALTH_CHECK_DELAY" ]; then
    export PGPOOL_HEALTH_CHECK_DELAY=1000
fi
# Ensure the script is run with the correct database connection pool health check max retries
if [ -z "$PGPOOL_HEALTH_CHECK_MAX_RETRIES" ]; then
    export PGPOOL_HEALTH_CHECK_MAX_RETRIES=3
fi