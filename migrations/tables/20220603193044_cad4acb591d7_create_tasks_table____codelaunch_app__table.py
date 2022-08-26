
"Create Tasks table -> @codelaunch/app (table)"
# Revision IO: cad4acb591d7
# Previous ID: 0cc4243ab21a
# Created: 2022-06-03 19:30:44.455982

import sqlalchemy as sa
from alembic import op, context



# All Environments
def up():
  op.execute('''
    CREATE FUNCTION codelaunch_app.increment_sequence()
      RETURNS trigger
      LANGUAGE plpgsql AS
    $func$
    BEGIN
      IF NEW.seq < OLD.seq THEN
        NEW.seq = NEW.seq + 1;
      ELSE
        NEW.seq = OLD.seq + 1;
      END IF;

      RETURN NEW;
    END
    $func$;
  ''')

  op.execute('''
    CREATE TABLE IF NOT EXISTS codelaunch_app.tasks (
      id varchar(80),
      seq integer NOT NULL DEFAULT 0,
      deleted boolean NOT NULL DEFAULT FALSE,
      updated timestamp with time zone NOT NULL DEFAULT now(),
      name varchar(100) NOT NULL,
      description text,
      unique (name),
      primary key (id)
    );

    CREATE UNIQUE INDEX tasks_name_index on codelaunch_app.tasks (LOWER(name));

    CREATE TRIGGER increment_sequence
    BEFORE UPDATE ON codelaunch_app.tasks
    FOR EACH ROW
    EXECUTE FUNCTION codelaunch_app.increment_sequence();

    GRANT ALL ON TABLE codelaunch_app.tasks TO member;
    GRANT EXECUTE ON FUNCTION codelaunch_app.increment_sequence TO member;
  ''')


def down():
  op.execute('''
    DROP TRIGGER IF EXISTS increment_sequence ON codelaunch_app.tasks CASCADE;
    DROP FUNCTION IF EXISTS codelaunch_app.increment_sequence CASCADE;
    DROP TABLE IF EXISTS codelaunch_app.tasks CASCADE;
  ''')



# Test Environments
def seed():
  pass


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
revision = 'cad4acb591d7'
down_revision = '0cc4243ab21a'
depends_on = None
branch_labels = None