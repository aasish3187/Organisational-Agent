import secrets
import string

ALPHABET = string.ascii_lowercase + string.digits


def new_id(prefix: str, length: int = 12) -> str:
    """Generate a prefixed random identifier (e.g., prj_a1b2c3d4e5f6)."""
    random_str = "".join(secrets.choice(ALPHABET) for _ in range(length))
    return f"{prefix}_{random_str}"
