import os
import psycopg2
from dotenv import load_dotenv

# Load env from parent dir or local
load_dotenv()

def reset_database():
    """
    DROPS everything in the public schema. 
    USE WITH CAUTION. DEV ONLY.
    """
    dbname = os.getenv('DB_NAME', 'postgres')
    user = os.getenv('DB_USER', 'postgres')
    password = os.getenv('DB_PASSWORD')
    host = os.getenv('DB_HOST')
    port = os.getenv('DB_PORT', '5432')

    conn = psycopg2.connect(
        dbname=dbname,
        user=user,
        password=password,
        host=host,
        port=port
    )
    conn.autocommit = True
    cur = conn.cursor()

    print("⚠️ WARNING: Dropping public schema to reset for UUID support...")
    cur.execute("DROP SCHEMA public CASCADE;")
    cur.execute("CREATE SCHEMA public;")
    cur.execute("GRANT ALL ON SCHEMA public TO postgres;")
    cur.execute("GRANT ALL ON SCHEMA public TO public;")
    
    print("✅ Schema reset successfully. You can now run migrations.")
    cur.close()
    conn.close()

if __name__ == "__main__":
    reset_database()
