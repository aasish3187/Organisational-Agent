import pytest
from app.services.merkle_anchor import MerkleTree, build_merkle_tree_for_events, hash_pair

def test_merkle_tree_construction_and_root():
    hashes = [
        "a" * 64,
        "b" * 64,
        "c" * 64,
        "d" * 64,
    ]
    tree = build_merkle_tree_for_events(hashes)
    assert len(tree.root) == 64
    assert len(tree.levels) == 3

def test_merkle_inclusion_proof_verification():
    hashes = ["e" * 64, "f" * 64, "1" * 64]
    tree = build_merkle_tree_for_events(hashes)

    for i, leaf in enumerate(hashes):
        proof = tree.get_proof(i)
        assert tree.verify_proof(leaf, proof, tree.root) is True

    # Tampered leaf should fail
    tampered_leaf = "9" * 64
    proof0 = tree.get_proof(0)
    assert tree.verify_proof(tampered_leaf, proof0, tree.root) is False
