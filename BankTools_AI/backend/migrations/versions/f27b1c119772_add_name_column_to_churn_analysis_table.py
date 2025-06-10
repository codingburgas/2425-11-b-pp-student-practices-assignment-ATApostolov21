"""Add name column to churn_analysis table

Revision ID: f27b1c119772
Revises: 8feeb5228e3d
Create Date: 2025-06-10 10:28:47.421860

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f27b1c119772'
down_revision = '8feeb5228e3d'
branch_labels = None
depends_on = None


def upgrade():
    # Add name column to churn_analysis table
    op.add_column('churn_analysis', sa.Column('name', sa.String(length=100), nullable=False, server_default='Unnamed Analysis'))


def downgrade():
    # Remove name column from churn_analysis table
    op.drop_column('churn_analysis', 'name')
