from database import engine
from models import Base
from sqlalchemy import text

print("Dropping all tables with CASCADE...")
# Use raw SQL to drop the entire schema and recreate it
# This handles all foreign key constraints and tables not known to SQLAlchemy
with engine.connect() as connection:
    try:
        connection.execute(text("DROP SCHEMA public CASCADE;"))
        connection.execute(text("CREATE SCHEMA public;"))
        connection.commit()
        print("Schema dropped and recreated.")
    except Exception as e:
        print(f"Error dropping schema: {e}")
        # Fallback to standard drop_all if schema drop fails (unlikely for postgres)
        connection.rollback()
        Base.metadata.drop_all(bind=engine)

print("Creating new tables...")
Base.metadata.create_all(bind=engine)

print("Database reset successfully! You can now run the server.")