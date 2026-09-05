"""Async SQLAlchemy database connection with dev mock fallback."""
import os
from typing import AsyncGenerator, Any

try:
    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
    from sqlalchemy.orm import DeclarativeBase

    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://dupescout:password@localhost:5432/dupescout",
    )

    engine = create_async_engine(
        DATABASE_URL,
        echo=os.getenv("SQL_ECHO", "false").lower() == "true",
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
    )

    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    class Base(DeclarativeBase):
        pass

    async def get_db() -> AsyncGenerator[Any, None]:
        async with SessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
except ImportError:
    class AsyncSession:
        pass

    class Base:
        pass

    async def get_db() -> AsyncGenerator[Any, None]:
        yield None

