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

df = pd.DataFrame(users)

if 'account_number' in df.columns:
    df.set_index('account_number', inplace=True)

#Data frame for user no
user_ids = df.index
print(df.head(30))



#df.info() 
# Uncomment below to export to CSV
# df.to_csv("users_export.csv", index=False, encoding="utf-8")
# print(f"✅ Exported {len(df)} users to users_export.csv")


# import os
# import jwt
# from dotenv import load_dotenv

# load_dotenv()

# user_jwt_token = os.getenv("USER_JWT_TOKEN")
# jwt_secret = os.getenv("SUPABASE_JWT_SECRET") or os.getenv("SUPABASE_SERVICE_ROLE")

# if not user_jwt_token:
#     print("❌ No JWT token found. Make sure the user has logged in from the frontend.")
#     print("💡 Tip: After login, save the token and pass it to this script.")
#     exit(1)

# if user_jwt_token.strip() == "":
#     print("❌ JWT token is empty. Double-check your .env or the way you're passing the token.")
#     exit(1)

# if not jwt_secret:
#     print("❌ JWT secret is missing. Make sure you have SUPABASE_JWT_SECRET or SERVICE_ROLE in your .env.")
#     exit(1)

# print("🔍 Attempting to decode JWT...\n")

# try:
#     decoded_preview = jwt.decode(user_jwt_token, options={"verify_signature": False})
#     print("🔎 Token Preview (UNVERIFIED):", decoded_preview)

#     decoded_token = jwt.decode(user_jwt_token, jwt_secret, algorithms=["HS256"])
#     user_id = decoded_token.get("sub")

#     if user_id:
#         print(f"✅ Logged-in User ID: {user_id}")
#     else:
#         print("⚠️ Token decoded but 'sub' (user_id) field is missing.")

# except jwt.ExpiredSignatureError:
#     print("❌ Token has expired.")
# except jwt.InvalidSignatureError:
#     print("❌ Invalid signature. The secret used to verify the token might be wrong.")
# except jwt.DecodeError:
#     print("❌ Token is malformed. Possibly incomplete or corrupted.")
# except jwt.InvalidTokenError as e:
#     print(f"❌ General token error: {e}")
# except Exception as e:
#     print(f"❌ Unexpected error: {type(e).__name__}: {e}")
