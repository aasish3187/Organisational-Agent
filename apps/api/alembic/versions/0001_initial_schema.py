"""Initial schema with all 12 tables and VERITAS columns

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-08-25 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = '0001_initial_schema'
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # projects
    op.create_table(
        'projects',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('title', sa.Text(), nullable=False),
        sa.Column('objective', sa.Text(), nullable=False),
        sa.Column('classification', sa.String(), server_default='internal', nullable=True),
        sa.Column('owner_session', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )

    # runs
    op.create_table(
        'runs',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('project_id', sa.String(), nullable=False),
        sa.Column('mode', sa.String(), server_default='BALANCED', nullable=False),
        sa.Column('status', sa.String(), server_default='INITIALIZING', nullable=False),
        sa.Column('model_policy', sa.String(), server_default='AUTO', nullable=True),
        sa.Column('budget_max_tokens', sa.Integer(), server_default='30000', nullable=True),
        sa.Column('budget_max_cost_usd', sa.Numeric(precision=10, scale=4), server_default='2.0', nullable=True),
        sa.Column('budget_max_minutes', sa.Integer(), server_default='10', nullable=True),
        sa.Column('tokens_used', sa.Integer(), server_default='0', nullable=True),
        sa.Column('cost_usd', sa.Numeric(precision=10, scale=4), server_default='0.0', nullable=True),
        sa.Column('is_demo_replay', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # agent_instances
    op.create_table(
        'agent_instances',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('run_id', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('parent_id', sa.String(), nullable=True),
        sa.Column('mandate', sa.Text(), nullable=True),
        sa.Column('permitted_tools', sa.JSON(), nullable=True),
        sa.Column('model_tier', sa.String(), server_default='reasoning', nullable=True),
        sa.Column('status', sa.String(), server_default='PENDING', nullable=True),
        sa.Column('token_budget', sa.Integer(), server_default='5000', nullable=True),
        sa.Column('tokens_used', sa.Integer(), server_default='0', nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['parent_id'], ['agent_instances.id']),
        sa.ForeignKeyConstraint(['run_id'], ['runs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # tasks
    op.create_table(
        'tasks',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('run_id', sa.String(), nullable=False),
        sa.Column('owner_agent_id', sa.String(), nullable=True),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('depends_on', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(), server_default='QUEUED', nullable=True),
        sa.Column('output_schema', sa.String(), nullable=False),
        sa.Column('token_budget', sa.Integer(), server_default='5000', nullable=True),
        sa.Column('tokens_used', sa.Integer(), server_default='0', nullable=True),
        sa.Column('review_required', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('revision_count', sa.Integer(), server_default='0', nullable=True),
        sa.Column('risk_level', sa.String(), server_default='low', nullable=True),
        sa.Column('queued_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['owner_agent_id'], ['agent_instances.id']),
        sa.ForeignKeyConstraint(['run_id'], ['runs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # artifacts
    op.create_table(
        'artifacts',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('task_id', sa.String(), nullable=False),
        sa.Column('project_id', sa.String(), nullable=True),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('schema_version', sa.String(), server_default='1.0', nullable=True),
        sa.Column('version', sa.Integer(), server_default='1', nullable=True),
        sa.Column('content', sa.JSON(), nullable=False),
        sa.Column('content_hash', sa.String(), nullable=False),
        sa.Column('confidence', sa.Numeric(precision=3, scale=2), nullable=True),
        sa.Column('assumptions', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(), server_default='submitted', nullable=True),
        sa.Column('review_state', sa.String(), nullable=True),
        sa.Column('producer_role', sa.String(), nullable=True),
        sa.Column('producer_model', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id']),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # evidence
    op.create_table(
        'evidence',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('project_id', sa.String(), nullable=True),
        sa.Column('artifact_id', sa.String(), nullable=True),
        sa.Column('source_url', sa.Text(), nullable=True),
        sa.Column('source_file', sa.Text(), nullable=True),
        sa.Column('excerpt', sa.Text(), nullable=False),
        sa.Column('tier', sa.String(), nullable=False),
        sa.Column('retrieved_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['artifact_id'], ['artifacts.id']),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # claims
    op.create_table(
        'claims',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('artifact_id', sa.String(), nullable=False),
        sa.Column('statement', sa.Text(), nullable=False),
        sa.Column('support_status', sa.String(), server_default='unsupported', nullable=True),
        sa.Column('evidence_ids', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['artifact_id'], ['artifacts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # reviews
    op.create_table(
        'reviews',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('artifact_id', sa.String(), nullable=True),
        sa.Column('run_id', sa.String(), nullable=True),
        sa.Column('reviewer_role', sa.String(), nullable=False),
        sa.Column('verdict', sa.String(), nullable=False),
        sa.Column('coverage_met', sa.JSON(), nullable=True),
        sa.Column('coverage_missing', sa.JSON(), nullable=True),
        sa.Column('contradictions', sa.JSON(), nullable=True),
        sa.Column('unsupported_claims', sa.JSON(), nullable=True),
        sa.Column('revision_tasks', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['artifact_id'], ['artifacts.id']),
        sa.ForeignKeyConstraint(['run_id'], ['runs.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # approvals
    op.create_table(
        'approvals',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('run_id', sa.String(), nullable=False),
        sa.Column('policy_id', sa.String(), nullable=False),
        sa.Column('gate_type', sa.String(), nullable=False),
        sa.Column('proposal', sa.JSON(), nullable=False),
        sa.Column('alternatives', sa.JSON(), nullable=True),
        sa.Column('risk_level', sa.String(), nullable=True),
        sa.Column('status', sa.String(), server_default='PENDING', nullable=True),
        sa.Column('human_response', sa.Text(), nullable=True),
        sa.Column('human_notes', sa.Text(), nullable=True),
        sa.Column('requested_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['run_id'], ['runs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # events (VERITAS hash chain)
    op.create_table(
        'events',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('run_id', sa.String(), nullable=False),
        sa.Column('sequence', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('actor', sa.String(), nullable=False),
        sa.Column('actor_id', sa.String(), nullable=True),
        sa.Column('payload', sa.JSON(), nullable=False),
        sa.Column('payload_canonical', sa.Text(), nullable=False),
        sa.Column('prev_hash', sa.String(length=64), nullable=False),
        sa.Column('hash', sa.String(length=64), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['run_id'], ['runs.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('run_id', 'sequence', name='uq_events_run_sequence'),
    )
    op.create_index('idx_events_run_id', 'events', ['run_id'])
    op.create_index('idx_events_run_sequence', 'events', ['run_id', 'sequence'])

    # metrics
    op.create_table(
        'metrics',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('run_id', sa.String(), nullable=True),
        sa.Column('agent_id', sa.String(), nullable=True),
        sa.Column('task_id', sa.String(), nullable=True),
        sa.Column('tokens_in', sa.Integer(), server_default='0', nullable=True),
        sa.Column('tokens_out', sa.Integer(), server_default='0', nullable=True),
        sa.Column('latency_ms', sa.Integer(), nullable=True),
        sa.Column('cost_usd', sa.Numeric(precision=10, scale=6), server_default='0.0', nullable=True),
        sa.Column('tool_calls', sa.Integer(), server_default='0', nullable=True),
        sa.Column('outcome', sa.String(), nullable=True),
        sa.Column('recorded_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['agent_id'], ['agent_instances.id']),
        sa.ForeignKeyConstraint(['run_id'], ['runs.id']),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # process_atoms (MNEMOS)
    op.create_table(
        'process_atoms',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('source_run_id', sa.String(), nullable=True),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('applicability', sa.JSON(), nullable=False),
        sa.Column('action', sa.Text(), nullable=False),
        sa.Column('purpose', sa.Text(), nullable=False),
        sa.Column('tags', sa.JSON(), nullable=False),
        sa.Column('embedding', sa.JSON(), nullable=True),
        sa.Column('visibility', sa.String(), server_default='shared', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['source_run_id'], ['runs.id']),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('process_atoms')
    op.drop_table('metrics')
    op.drop_index('idx_events_run_sequence', table_name='events')
    op.drop_index('idx_events_run_id', table_name='events')
    op.drop_table('events')
    op.drop_table('approvals')
    op.drop_table('reviews')
    op.drop_table('claims')
    op.drop_table('evidence')
    op.drop_table('artifacts')
    op.drop_table('tasks')
    op.drop_table('agent_instances')
    op.drop_table('runs')
    op.drop_table('projects')
