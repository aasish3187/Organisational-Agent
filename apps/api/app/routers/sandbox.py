from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.services.sandbox_executor import sandbox_executor

router = APIRouter(prefix="/sandbox", tags=["Sandbox"])


class CodeExecutionRequest(BaseModel):
    code: str = Field(..., min_length=1)
    timeout_seconds: float = Field(default=5.0, ge=0.5, le=30.0)


class ValidationRequest(BaseModel):
    code: str = Field(..., min_length=1)


@router.post("/validate")
async def validate_code_syntax(payload: ValidationRequest) -> dict[str, Any]:
    return sandbox_executor.validate_syntax(payload.code)


@router.post("/execute")
async def execute_in_sandbox(payload: CodeExecutionRequest) -> dict[str, Any]:
    return await sandbox_executor.execute_code(
        code=payload.code,
        timeout=payload.timeout_seconds,
    )
