from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import psycopg2
from psycopg2.extras import RealDictCursor
from groq import Groq
import config
import logging
import os

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database schema
DATABASE_SCHEMA = {}

# Initialize Groq client
groq_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler"""
    global groq_client, DATABASE_SCHEMA
    
    # Startup
    try:
        groq_client = Groq(api_key=config.GROQ_API_KEY)
        logger.info("✓ Groq client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Groq: {str(e)}")
    
    try:
        DATABASE_SCHEMA = get_database_schema()
        logger.info(f"✓ Loaded schema for {len(DATABASE_SCHEMA)} tables")
    except Exception as e:
        logger.error(f"Failed to load schema: {str(e)}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title="Vanna AI Analytics API",
    description="Natural language to SQL interface",
    version="1.0.0",
    lifespan=lifespan
)

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://analytics-dashboard-five-mocha.vercel.app",
    "https://analytics-dashboard-web-iota.vercel.app",
]

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    """Get database connection"""
    try:
        conn = psycopg2.connect(config.DATABASE_URL, connect_timeout=10)
        return conn
    except Exception as e:
        logger.error(f"DB connection failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Database connection failed")

def get_database_schema():
    """Fetch database schema"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        tables = cursor.fetchall()
        
        schema_info = {}
        for table in tables:
            table_name = table['table_name']
            cursor.execute("""
                SELECT column_name, data_type
                FROM information_schema.columns 
                WHERE table_name = %s
                ORDER BY ordinal_position
            """, (table_name,))
            schema_info[table_name] = cursor.fetchall()
        
        cursor.close()
        conn.close()
        return schema_info
    except Exception as e:
        logger.error(f"Failed to fetch schema: {str(e)}")
        return {}

def create_schema_description(schema_info):
    """Create schema description for LLM"""
    description = "PostgreSQL Database Schema:\n\n"
    
    for table_name, columns in schema_info.items():
        description += f'Table "{table_name}":\n'
        for col in columns:
            description += f'  - "{col["column_name"]}" ({col["data_type"]})\n'
        description += "\n"
    
    description += """Key Relationships:
- Document.id → Invoice.documentId
- Invoice.vendorId → Vendor.id
- Invoice.customerId → Customer.id
- Invoice.id → LineItem.invoiceId
- Invoice.id → Payment.invoiceId
- Invoice.id → Summary.invoiceId

CRITICAL RULES:
1. ALL table and column names MUST use double quotes: "TableName", "columnName"
2. Use ABS() for invoice amounts to get positive values
3. Table names are case-sensitive: "Invoice" not "invoice"
4. For aggregations, always use proper GROUP BY
5. For dates, use PostgreSQL date functions

Example Queries:
Q: Total spend
A: SELECT SUM(ABS("invoiceTotal")) as total_spend FROM "Summary"

Q: Top 5 vendors
A: SELECT v.name, SUM(ABS(s."invoiceTotal")) as total FROM "Vendor" v JOIN "Invoice" i ON v.id = i."vendorId" JOIN "Summary" s ON i.id = s."invoiceId" GROUP BY v.name ORDER BY total DESC LIMIT 5

Q: Recent invoices
A: SELECT i."invoiceNumber", v.name as vendor, i."invoiceDate", ABS(s."invoiceTotal") as amount FROM "Invoice" i JOIN "Vendor" v ON i."vendorId" = v.id JOIN "Summary" s ON i.id = s."invoiceId" ORDER BY i."invoiceDate" DESC LIMIT 10

Q: Invoices from last 90 days
A: SELECT i."invoiceNumber", v.name, i."invoiceDate", ABS(s."invoiceTotal") as amount FROM "Invoice" i JOIN "Vendor" v ON i."vendorId" = v.id JOIN "Summary" s ON i.id = s."invoiceId" WHERE i."invoiceDate" >= CURRENT_DATE - INTERVAL '90 days' ORDER BY i."invoiceDate" DESC
"""
    return description

def generate_sql_with_groq(question: str) -> str:
    """Generate SQL using Groq"""
    if not groq_client:
        raise HTTPException(status_code=503, detail="Groq not initialized")
    
    schema_desc = create_schema_description(DATABASE_SCHEMA)
    
    system_prompt = f"""You are a PostgreSQL expert. Generate ONLY the SQL query, no explanations or markdown.

{schema_desc}

Generate SQL for this question. Return ONLY the SQL query:"""
    
    try:
        response = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": question}
            ],
            model="llama-3.3-70b-versatile",  # UPDATED MODEL
            temperature=0.1,
            max_tokens=500,
        )
        
        sql = response.choices[0].message.content.strip()
        
        # Clean up the SQL
        sql = sql.replace("```sql", "").replace("```", "").strip()
        
        # Remove any leading/trailing whitespace and newlines
        sql = " ".join(sql.split())
        
        return sql
    except Exception as e:
        logger.error(f"Groq error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"SQL generation failed: {str(e)}")

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    question: str
    sql: str
    results: list
    text: str
    error: str = None

@app.post("/query")
async def query_data(request: QueryRequest):
    """Process natural language query"""
    logger.info(f"Query: {request.question}")
    
    try:
        # Generate SQL
        sql = generate_sql_with_groq(request.question)
        logger.info(f"Generated SQL: {sql}")
        
        if not sql:
            return {
                "question": request.question,
                "sql": "",
                "results": [],
                "text": "Could not generate SQL",
                "error": "SQL generation failed"
            }
        
        # Execute SQL
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute(sql)
        results = cursor.fetchall()
        results_list = [dict(row) for row in results]
        
        cursor.close()
        conn.close()
        
        logger.info(f"Returned {len(results_list)} results")
        
        return {
            "question": request.question,
            "sql": sql,
            "results": results_list,
            "text": f"Found {len(results_list)} result{'s' if len(results_list) != 1 else ''}"
        }
        
    except psycopg2.Error as e:
        logger.error(f"SQL error: {str(e)}")
        return {
            "question": request.question,
            "sql": sql if 'sql' in locals() else "",
            "results": [],
            "text": "SQL execution failed",
            "error": str(e)
        }
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check"""
    db_healthy = False
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()
        db_healthy = True
    except:
        pass
    
    return {
        "status": "healthy" if (db_healthy and groq_client) else "degraded",
        "database": "connected" if db_healthy else "disconnected",
        "groq": "initialized" if groq_client else "not initialized",
        "tables": len(DATABASE_SCHEMA),
        "service": "Vanna AI Analytics"
    }

@app.get("/")
async def root():
    """Root"""
    return {
        "message": "Vanna AI Analytics API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=config.PORT, log_level="info")