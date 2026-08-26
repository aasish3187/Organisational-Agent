import pytest
from app.services.sandbox_executor import sandbox_executor

def test_sandbox_syntax_validation():
    valid_code = "def hello():\n    return 42"
    invalid_code = "def hello( :\n    return"
    
    val_ok = sandbox_executor.validate_syntax(valid_code)
    assert val_ok["valid"] is True
    assert "hello" in val_ok["functions_found"]

    val_err = sandbox_executor.validate_syntax(invalid_code)
    assert val_err["valid"] is False
    assert val_err["error"] is not None

@pytest.mark.asyncio
async def test_sandbox_execution_success():
    code = "print('NEXUS_SANDBOX_OUTPUT_12345')"
    res = await sandbox_executor.execute_code(code)
    assert res["success"] is True
    assert res["exit_code"] == 0
    assert "NEXUS_SANDBOX_OUTPUT_12345" in res["stdout"]

@pytest.mark.asyncio
async def test_sandbox_execution_timeout():
    code = "import time; time.sleep(2.0)"
    res = await sandbox_executor.execute_code(code, timeout=0.5)
    assert res["success"] is False
    assert res["timed_out"] is True
