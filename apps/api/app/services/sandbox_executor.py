import ast
import asyncio
import logging
import sys
import time
from typing import Any

logger = logging.getLogger("nexus.sandbox_executor")


class SandboxExecutor:
    def __init__(self, default_timeout: float = 5.0, max_output_chars: int = 8000):
        self.default_timeout = default_timeout
        self.max_output_chars = max_output_chars

    def validate_syntax(self, code: str) -> dict[str, Any]:
        try:
            tree = ast.parse(code)
            functions = [n.name for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]
            classes = [n.name for n in ast.walk(tree) if isinstance(n, ast.ClassDef)]
            return {
                "valid": True,
                "error": None,
                "functions_found": functions,
                "classes_found": classes,
            }
        except SyntaxError as e:
            return {
                "valid": False,
                "error": f"Line {e.lineno}: {e.msg}",
                "functions_found": [],
                "classes_found": [],
            }

    async def execute_code(
        self,
        code: str,
        timeout: float | None = None,
    ) -> dict[str, Any]:
        val = self.validate_syntax(code)
        if not val["valid"]:
            return {
                "success": False,
                "exit_code": 1,
                "stdout": "",
                "stderr": f"Syntax Error: {val['error']}",
                "duration_ms": 0,
                "timed_out": False,
            }

        t_limit = timeout or self.default_timeout
        start_time = time.time()

        try:
            proc = await asyncio.create_subprocess_exec(
                sys.executable,
                "-c",
                code,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            try:
                stdout_bytes, stderr_bytes = await asyncio.wait_for(
                    proc.communicate(),
                    timeout=t_limit,
                )
                duration_ms = int((time.time() - start_time) * 1000)
                stdout_str = stdout_bytes.decode("utf-8", errors="replace")[: self.max_output_chars]
                stderr_str = stderr_bytes.decode("utf-8", errors="replace")[: self.max_output_chars]

                return {
                    "success": proc.returncode == 0,
                    "exit_code": proc.returncode,
                    "stdout": stdout_str,
                    "stderr": stderr_str,
                    "duration_ms": duration_ms,
                    "timed_out": False,
                }
            except asyncio.TimeoutError:
                proc.kill()
                await proc.wait()
                duration_ms = int((time.time() - start_time) * 1000)
                return {
                    "success": False,
                    "exit_code": -1,
                    "stdout": "",
                    "stderr": f"Execution timed out after {t_limit}s",
                    "duration_ms": duration_ms,
                    "timed_out": True,
                }
        except Exception as e:
            logger.error("Sandbox execution exception: %s", str(e))
            return {
                "success": False,
                "exit_code": 1,
                "stdout": "",
                "stderr": str(e),
                "duration_ms": int((time.time() - start_time) * 1000),
                "timed_out": False,
            }


sandbox_executor = SandboxExecutor()
