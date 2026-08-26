from contextvars import ContextVar
from typing import Annotated
from fastapi import Header, Request

tenant_context: ContextVar[str] = ContextVar("tenant_context", default="default-tenant")


def get_current_tenant() -> str:
    return tenant_context.get()


def set_current_tenant(tenant_id: str) -> None:
    tenant_context.set(tenant_id or "default-tenant")


async def tenant_dependency(
    x_tenant_id: Annotated[str | None, Header(alias="X-Tenant-ID")] = None,
) -> str:
    tid = x_tenant_id.strip() if x_tenant_id and x_tenant_id.strip() else "default-tenant"
    set_current_tenant(tid)
    return tid
