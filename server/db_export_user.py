from supabase import create_client
import pandas as pd
import os
from dotenv import load_dotenv
import numpy as np

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE")  # Use service role for full access

supabase = create_client(url, key)

# Fetch users
res = supabase.table("users").select("*").execute()
users = res.data

# Convert to DataFrame and save
df = pd.DataFrame(users)
df.to_csv("users_export.csv", index=False, encoding="utf-8")
print(f"✅ Exported {len(df)} users to users_export.csv")


