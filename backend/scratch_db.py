from django.db import connection

queries = [
    "ALTER TABLE medicines_inventory ADD COLUMN IF NOT EXISTS brand varchar(255) NULL;",
    "ALTER TABLE medicines_inventory ADD COLUMN IF NOT EXISTS strength varchar(50) NULL;",
    "ALTER TABLE medicines_inventory ADD COLUMN IF NOT EXISTS route varchar(50) NULL;",
    "ALTER TABLE medicines_inventory ADD COLUMN IF NOT EXISTS frequency varchar(100) NULL;",
    "ALTER TABLE medicines_inventory ADD COLUMN IF NOT EXISTS recommended_duration varchar(100) NULL;",
    "ALTER TABLE medicines_inventory ADD COLUMN IF NOT EXISTS usage_instructions text NULL;",
    "ALTER TABLE medicines_inventory ADD COLUMN IF NOT EXISTS expiry_date date NULL;",
    "ALTER TABLE medicines_inventory ADD COLUMN IF NOT EXISTS manufacture_date date NULL;",
    "ALTER TABLE medicines_inventory ADD COLUMN IF NOT EXISTS batch_number varchar(100) NULL;"
]

cursor = connection.cursor()
for q in queries:
    try:
        cursor.execute(q)
        print(f"Executed: {q}")
    except Exception as e:
        print(f"Failed: {q} -> {e}")

print("Done.")
