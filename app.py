from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from database import init_db
from api.routes import router
from logger import get_logger

logger = get_logger("App")

app = FastAPI(
    title="TicketIQ – AI Support Ticket Triage Platform",
    description="AI-powered ticket analysis, automated categorization, priority prediction, and team routing API.",
    version="1.0.0"
)

# CORS Middleware for Web & Mobile App consumption
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to initialize database
@app.on_event("startup")
def startup_event():
    logger.info("Initializing TicketIQ application and database tables...")
    init_db()

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    logger.info(f"{request.method} {request.url.path} -> {response.status_code} ({process_time:.2f}ms)")
    return response

app.include_router(router)

@app.get("/")
def home():
    return {"message": "TicketIQ API Running", "status": "active", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "healthy", "database": "connected"}

# Global Exception Handler
@app.exception_handler(Exception)
def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "details": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)