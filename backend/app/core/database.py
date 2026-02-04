import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. URL базы данных. Для SQLite это просто файл в текущей папке.
SQLALCHEMY_DATABASE_URL = os.getenv("SQLALCHEMY_DATABASE_URL", "sqlite:///./sandbox.db")

if SQLALCHEMY_DATABASE_URL.startswith("sqlite:///") and ":memory:" not in SQLALCHEMY_DATABASE_URL:
    raw_path = SQLALCHEMY_DATABASE_URL.replace("sqlite:///", "", 1)
    db_path = Path(raw_path)
    if not db_path.is_absolute():
        db_path = (Path.cwd() / db_path).resolve()
    db_path.parent.mkdir(parents=True, exist_ok=True)

# 2. Создаем движок (Engine).
# connect_args={"check_same_thread": False} нужен ТОЛЬКО для SQLite.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Создаем фабрику сессий. Через SessionLocal мы будем делать запросы.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Базовый класс для наших моделей. От него мы будем наследовать таблицы.
Base = declarative_base()

# Вспомогательная функция для получения сессии (понадобится позже в роутерах)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
