
"Create Tasks table -> @codelaunch/app (table)"
# Revision IO: 6115ca822913
# Previous ID: 2979276ace33
# Created: 2022-08-27 10:14:03.267366

import sqlalchemy as sa
from alembic import op, context



# All Environments
def up():
  op.execute('''
    create function codelaunch_app.graphql_subscription() returns trigger as $$
    declare
      v_process_new bool = (TG_OP = 'INSERT' OR TG_OP = 'UPDATE');
      v_process_old bool = (TG_OP = 'UPDATE' OR TG_OP = 'DELETE');
      v_event text = TG_ARGV[0];
      v_topic_template text = TG_ARGV[1];
      v_attribute text = TG_ARGV[2];
      v_record record;
      v_sub text;
      v_topic text;
      v_i int = 0;
      v_last_topic text;
    begin
      -- On UPDATE sometimes topic may be changed for NEW record,
      -- so we need notify to both topics NEW and OLD.
      for v_i in 0..1 loop
        if (v_i = 0) and v_process_new is true then
          v_record = new;
        elsif (v_i = 1) and v_process_old is true then
          v_record = old;
        else
          continue;
        end if;
        if v_attribute is not null then
          execute 'select $1.' || quote_ident(v_attribute)
            using v_record
            into v_sub;
        end if;
        if v_sub is not null then
          v_topic = replace(v_topic_template, '$1', v_sub);
        else
          v_topic = v_topic_template;
        end if;
        if v_topic is distinct from v_last_topic then
          -- This if statement prevents us from triggering the same notification twice
          v_last_topic = v_topic;
          perform pg_notify(v_topic, json_build_object(
            'event', v_event,
            'subject', v_sub
          )::text);
        end if;
      end loop;
      return v_record;
    end;
    $$ language plpgsql volatile set search_path from current;
  ''')


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

  op.execute('''
    CREATE TRIGGER subscribe_task
    AFTER INSERT OR UPDATE OR DELETE ON codelaunch_app.tasks
    FOR EACH ROW
    EXECUTE PROCEDURE codelaunch_app.graphql_subscription(
      'taskUpdated', -- the "event" string, useful for the client to know what happened
      'graphql:task', -- the "topic" the event will be published to, as a template
      'id' -- If specified, `$1` above will be replaced with NEW.id or OLD.id from the trigger.
    );
  ''')


def down():
  op.execute('''
    DROP TRIGGER IF EXISTS subscribe_task ON codelaunch_app.tasks CASCADE;
    DROP TRIGGER IF EXISTS increment_sequence ON codelaunch_app.tasks CASCADE;
    DROP FUNCTION IF EXISTS codelaunch_app.graphql_subscription CASCADE;
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
# used to compare schema diff changes with 'source', and does not ever
# need mock seed data.
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
revision = '6115ca822913'
down_revision = '2979276ace33'
depends_on = None
branch_labels = None