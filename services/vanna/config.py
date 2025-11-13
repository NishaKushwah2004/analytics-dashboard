import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://analytics_user:analytics_pass@localhost:5432/analytics_db")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
PORT = int(os.getenv("PORT", 8000))

# Database connection details
def get_db_config():
    """Parse DATABASE_URL into connection details"""
    # Example: postgresql://user:pass@host:5432/dbname
    if DATABASE_URL.startswith("postgresql://"):
        url = DATABASE_URL.replace("postgresql://", "")
        if "@" in url:
            auth, rest = url.split("@", 1)
            user, password = auth.split(":", 1)
            host_port, dbname = rest.split("/", 1)
            host, port = host_port.split(":", 1) if ":" in host_port else (host_port, "5432")
            
            return {
                "user": user,
                "password": password,
                "host": host,
                "port": port,
                "dbname": dbname
            }
    return None