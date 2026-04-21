import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medlink.settings')
django.setup()

def check_db():
    print("Connecting to database...")
    try:
        with connection.cursor() as cursor:
            # Check if medicines_medicine table exists
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
            tables = [t[0] for t in cursor.fetchall()]
            
            print("\n--- DATABASE TABLES ---")
            for table in sorted(tables):
                print(f"- {table}")
            
            if 'medicines_medicine' in tables:
                print("\nTable 'medicines_medicine' EXISTS.")
                # Check columns
                cursor.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'medicines_medicine'")
                columns = cursor.fetchall()
                print("\n--- COLUMNS IN medicines_medicine ---")
                for col in columns:
                    print(f"- {col[0]} ({col[1]})")
            else:
                print("\nTable 'medicines_medicine' is MISSING!")
                
    except Exception as e:
        print(f"\nCONNECTION FAILED: {str(e)}")

if __name__ == "__main__":
    check_db()
