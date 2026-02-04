from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# УБРАЛ users из импорта, оставил только то, что у нас реально есть
from app.routers import auth, products 
from app.core.database import engine
from app.models import models

# --- СОЗДАНИЕ ТАБЛИЦ ---
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CyberShop QA Sandbox",
    description="Песочница для отработки навыков тестирования API.",
    version="1.0.0",
)

# --- НАСТРОЙКА CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ПОДКЛЮЧЕНИЕ РОУТЕРОВ ---
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
# app.include_router(users.router, prefix="/users", tags=["Users"])  <-- УДАЛИЛ ЭТУ СТРОКУ
app.include_router(products.router, prefix="/products", tags=["Products"])

# --- ГЛАВНАЯ СТРАНИЦА ---
@app.get("/", tags=["System"])
async def root():
    return {"message": "Welcome to CyberShop API Sandbox", "status": "active"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)