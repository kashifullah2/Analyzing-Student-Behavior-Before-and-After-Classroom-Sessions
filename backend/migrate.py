from database import engine
from sqlalchemy import text
print("Connected to DB, running alter...")
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE emotion_data ADD COLUMN person_id INTEGER DEFAULT -1;"))
        conn.commit()
    print("Column person_id added successfully.")
except Exception as e:
    print("Error (or already exists):", e)
