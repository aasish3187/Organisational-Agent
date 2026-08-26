import hashlib
import json
from typing import Any


def sha256_hex(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def hash_pair(left: str, right: str) -> str:
    combined = left + right
    return hashlib.sha256(combined.encode("utf-8")).hexdigest()


class MerkleTree:
    def __init__(self, leaves: list[str]):
        self.raw_leaves = leaves
        self.leaves = leaves if leaves else ["0" * 64]
        self.levels: list[list[str]] = []
        self._build_tree()

    def _build_tree(self) -> None:
        current_level = list(self.leaves)
        self.levels.append(current_level)

        while len(current_level) > 1:
            next_level = []
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                right = current_level[i + 1] if i + 1 < len(current_level) else left
                parent = hash_pair(left, right)
                next_level.append(parent)
            current_level = next_level
            self.levels.append(current_level)

    @property
    def root(self) -> str:
        return self.levels[-1][0] if self.levels else ("0" * 64)

    def get_proof(self, leaf_index: int) -> list[dict[str, str]]:
        if leaf_index < 0 or leaf_index >= len(self.leaves):
            raise ValueError(f"Leaf index {leaf_index} out of bounds")

        proof = []
        idx = leaf_index
        for level in self.levels[:-1]:
            is_right_child = idx % 2 == 1
            sibling_idx = idx - 1 if is_right_child else idx + 1
            if sibling_idx < len(level):
                sibling_hash = level[sibling_idx]
            else:
                sibling_hash = level[idx]

            proof.append({
                "position": "left" if is_right_child else "right",
                "hash": sibling_hash,
            })
            idx //= 2
        return proof

    @staticmethod
    def verify_proof(leaf_hash: str, proof: list[dict[str, str]], expected_root: str) -> bool:
        current = leaf_hash
        for step in proof:
            sibling = step["hash"]
            if step["position"] == "left":
                current = hash_pair(sibling, current)
            else:
                current = hash_pair(current, sibling)
        return current == expected_root


def build_merkle_tree_for_events(event_hashes: list[str]) -> MerkleTree:
    return MerkleTree(event_hashes)
