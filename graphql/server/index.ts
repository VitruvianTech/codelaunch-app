import { makeExtendSchemaPlugin, gql } from 'graphile-utils'


// https://www.graphile.org/postgraphile/subscriptions/
export default [
  makeExtendSchemaPlugin(({ graphql, pgSql: sql }) => {

    return {

      typeDefs: gql`
        type TaskSubscriptionPayload {
          # This is populated by our resolver below
          task: Task
          # This is returned directly from the PostgreSQL subscription payload (JSON object)
          event: String
        }

        extend type Subscription {
          """
          Triggered when the current user's data changes:
          - direct modifications to the user
          - when their organization membership changes

          currentUserUpdated: UserSubscriptionPayload @pgSubscription(topic: \${embed(
            currentUserTopicFromContext
          )})
          """
          taskUpdated: TaskSubscriptionPayload @pgSubscription(topic: "graphql:task")
        }
      `,
  
      resolvers: {
  
        TaskSubscriptionPayload: {
          // This method finds the user from the database based on the event
          // published by PostgreSQL.
          //
          // In a future release, we hope to enable you to replace this entire
          // method with a small schema directive above, should you so desire. It's
          // mostly boilerplate.
          async task(
            event,
            args,
            context,
            { graphile: { selectGraphQLResultFromTable } }
          ) {
            const rows = await selectGraphQLResultFromTable(
              sql.fragment`codelaunch_app.tasks`,
              (tableAlias, sqlBuilder) => {
                sqlBuilder.where(
                  sql.fragment`${tableAlias}.id = ${sql.value(event.subject)}`
                )
              }
            )

            return rows[0]
          }
        }
  
      }
  
    }
  
  })
]