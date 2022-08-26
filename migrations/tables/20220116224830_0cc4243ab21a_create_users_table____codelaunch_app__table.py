
"Create Users table -> @codelaunch/app (table)"
# Revision IO: 0cc4243ab21a
# Previous ID: 
# Created: 2022-01-16 22:48:30.636595

import sqlalchemy as sa
from alembic import op, context
from sqlalchemy import String
from sqlalchemy.sql import table, column



# All Environments
def up():
  op.execute('''
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA codelaunch_app TO guest;
    ALTER DEFAULT PRIVILEGES IN SCHEMA codelaunch_app GRANT USAGE, SELECT ON SEQUENCES TO guest;

    CREATE TABLE IF NOT EXISTS codelaunch_app.users (
      id serial primary key,
      sub text
    );

    ALTER TABLE IF EXISTS codelaunch_app.users
      ENABLE ROW LEVEL SECURITY;

    GRANT ALL ON TABLE codelaunch_app.users TO member;

    CREATE POLICY read_users
      ON codelaunch_app.users
      FOR SELECT
      TO member
      USING (sub = current_user_id() AND current_user_can('read:users'));
  ''')

def down():
  op.execute('''
    DROP POLICY read_users ON codelaunch_app.users;
    DROP TABLE IF EXISTS codelaunch_app.users CASCADE;
    REASSIGN OWNED BY guest TO postgres;
    DROP OWNED BY guest;
  ''')



# Test Environments
def seed():
  op.bulk_insert(
    table('users',
      column('sub', String),
      schema='codelaunch_app'
    ),
    [
      {'sub': 'google-oauth2|118300562672994246824'},
      {'sub': 'google-oauth2|106349299808563719517'},
    ]
  )


def unseed():
  pass



# Migration Interface
#
# @param {enum<string>} engine_name
# Value can be 'source' or 'target'
#
# Database (engine) 'target' only runs in local development environments,
# and does not ever need mock seed data.
#
# Database (engine) 'source' always runs in any environment.
def upgrade(engine_name):
  env = context.get_x_argument(as_dictionary=True).get('env', None)

  up()

  if (env == 'development' or env == 'testing') and engine_name == 'source':
    seed()


def downgrade(engine_name):
  env = context.get_x_argument(as_dictionary=True).get('env', None)

  if (env == 'development' or env == 'testing') and engine_name == 'source':
    unseed()

  down()


# Used by Alembic
revision = '0cc4243ab21a'
down_revision = None
depends_on = 'bf05c9f6f75c'
branch_labels = ('codelaunch_app',)