import psycopg2
import csv
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Connect to your PostgreSQL DB
conn = psycopg2.connect(
    host=os.getenv('DB_HOST'),
    port=os.getenv('DB_PORT'),
    database=os.getenv('DB_NAME'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD')
)
cur = conn.cursor()

# Query all user details - adjust table/columns as needed
cur.execute("SELECT * FROM users")
rows = cur.fetchall()
columns = [desc[0] for desc in cur.description]

# Export data to CSV
csv_file = 'users_export.csv'
with open(csv_file, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(columns)
    writer.writerows(rows)

print(f"✅ Exported {len(rows)} user records to {csv_file}")

cur.close()
conn.close()
