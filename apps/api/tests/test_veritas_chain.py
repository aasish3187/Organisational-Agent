import pytest
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.event import Event
from app.models.project import Project
from app.models.run import Run
from app.services.veritas import GENESIS_HASH, emit_event, verify_chain


@pytest.mark.asyncio
async def test_veritas_chain_integrity(test_session: AsyncSession):
    # Create project and run
    project = Project(
        id="prj_test1",
        title="Test Project",
        objective="Test Objective",
        owner_session="session_123",
    )
    test_session.add(project)

    run = Run(
        id="run_test1",
        project_id="prj_test1",
        mode="BALANCED",
        status="RUNNING",
    )
    test_session.add(run)
    await test_session.commit()

    # Emit first event
    evt0 = await emit_event(
        test_session,
        run_id="run_test1",
        event_type="task_queued",
        actor="system",
        payload={"task_id": "tsk_1", "role": "research"},
    )
    await test_session.commit()
    assert evt0.sequence == 0
    assert evt0.prev_hash == GENESIS_HASH

    # Emit second event
    evt1 = await emit_event(
        test_session,
        run_id="run_test1",
        event_type="task_started",
        actor="research",
        payload={"task_id": "tsk_1"},
    )
    await test_session.commit()
    assert evt1.sequence == 1
    assert evt1.prev_hash == evt0.hash

    # Verify chain passes
    verification = await verify_chain(test_session, "run_test1")
    assert verification["valid"] is True
    assert verification["event_count"] == 2
    assert verification["broken_at_index"] is None


@pytest.mark.asyncio
async def test_veritas_detects_tampered_payload(test_session: AsyncSession):
    project = Project(
        id="prj_test2",
        title="Test Project 2",
        objective="Test Objective 2",
        owner_session="session_123",
    )
    test_session.add(project)
    run = Run(
        id="run_test2",
        project_id="prj_test2",
        mode="BALANCED",
        status="RUNNING",
    )
    test_session.add(run)
    await test_session.commit()

    await emit_event(
        test_session,
        run_id="run_test2",
        event_type="task_queued",
        actor="system",
        payload={"amount": 100},
    )
    await test_session.commit()

    # Update canonical payload to simulate database tampering
    await test_session.execute(
        update(Event)
        .where(Event.run_id == "run_test2", Event.sequence == 0)
        .values(payload_canonical='{"amount":9999}')
    )
    await test_session.commit()

    # Verification should detect tamper
    verification = await verify_chain(test_session, "run_test2")
    assert verification["valid"] is False
    assert verification["broken_at_index"] == 0
    assert "hash mismatch" in verification["message"]
