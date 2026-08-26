import pytest
from app.core.tenant import get_current_tenant, set_current_tenant

def test_tenant_context():
    assert get_current_tenant() == "default-tenant"
    set_current_tenant("org-enterprise-corp")
    assert get_current_tenant() == "org-enterprise-corp"
    set_current_tenant("")
    assert get_current_tenant() == "default-tenant"
