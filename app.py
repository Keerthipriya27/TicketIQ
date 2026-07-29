from fastapi import FastAPI
from api.routes import router

app = FastAPI(
    title="TicketIQ",
    version="1.0"
)

app.include_router(router)

@app.get("/")
def home():
    return {"message":"TicketIQ API Running"}

@app.get("/health")
def health():
    return {"status":"healthy"}