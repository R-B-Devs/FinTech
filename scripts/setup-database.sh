#!/bin/bash
set -e

# enable verbose output
set -x

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


echo "Starting MongoDB database setup..."

# Required environment variables
MONGO_URI="${MONGO_URI:-}"
MONGO_DB="${MONGO_DB:-fintech_db}"

if [ -z "$MONGO_URI" ]; then
  echo "MONGO_URI environment variable is not set."
  exit 1
fi

echo "Connecting to MongoDB cluster..."
# Create a temporary JS file to create the DB
TMP_JS=$(mktemp)
cat > "$TMP_JS" <<EOF
db = db.getSiblingDB("$MONGO_DB");
db.init.insertOne({init: true});
EOF

# Run the script using mongosh (preferred) or mongo
if command -v mongosh >/dev/null 2>&1; then
  mongosh "$MONGO_URI" "$TMP_JS"
elif command -v mongo >/dev/null 2>&1; then
  mongo "$MONGO_URI" "$TMP_JS"
else
  echo "❌ Neither mongosh nor mongo shell is installed."
  rm -f "$TMP_JS"
  exit 1
fi

rm -f "$TMP_JS"
echo "✅ MongoDB database '$MONGO_DB' setup complete."