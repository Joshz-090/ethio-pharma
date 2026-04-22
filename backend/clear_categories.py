from django.db import connection
cursor = connection.cursor()
cursor.execute("UPDATE medicines_medicine SET category = NULL;")
print("Cleared category fields")
