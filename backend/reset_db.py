from database import engine
from models import Base

print("Dropping old tables...")
Base.metadata.drop_all(bind=engine)

print("Creating new tables...")
Base.metadata.create_all(bind=engine)

print("Database reset successfully! You can now run the server.")