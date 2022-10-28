// @ts-ignore
import { asc } from 'codelaunch/lib/utils'
// @ts-ignore
import { datetime } from '@codelaunch/app/lib/utils'

import {
  ListTasksDocument,
  DetailTaskDocument
// @ts-ignore
} from 'gql'


export default {

  resolvers: {

    Query: {

      taskById: (_, args) => ({ __typename: 'Task', id: args.id })

    },

    Task: {

      updated: (parent, _args, cache) => datetime(cache.resolve(parent, "updated"))

    }

  },

  updates: {

    Subscription: {

      taskUpdated: (result, args, cache, info) => {
        if(result.taskUpdated.task) {
          const taskById = (cache.readQuery({ query: DetailTaskDocument, variables: result.taskUpdated.task.id }) || {}).taskById

          if(taskById) {
            cache.updateQuery({
              query: DetailTaskDocument,
              variables: { id: result.taskUpdated.task.id }
            }, data => ({
              ...data,
              taskById
            }))

            cache.updateQuery({ query: ListTasksDocument }, data => data ? {
              ...data,
              allTasksList: data.allTasksList.sort(asc('name'))
            } : data)
          }
        }
      }

    },

    Mutation: {

      createTask: (result, args, cache, info) => {
        if(result.createTask) {
          cache.updateQuery({ query: ListTasksDocument }, data => data ? {
            ...data,
            allTasksList: data.allTasksList
              .concat(result.createTask.task)
              .sort(asc('name'))
          } : data)

          cache.updateQuery({
            query: DetailTaskDocument,
            variables: { id: result.createTask.task.id }
          }, data => ({
            ...data,
            taskById: result.createTask.task
          }))
        }
      },

      updateTaskById: (result, args, cache, info) => {
        if(result.updateTaskById) {
          cache.updateQuery({ query: ListTasksDocument }, data => data ? {
            ...data,
            allTasksList: data.allTasksList.sort(asc('name'))
          } : data)

          cache.updateQuery({
            query: DetailTaskDocument,
            variables: { id: result.updateTaskById.task.id }
          }, data => ({
            ...data,
            taskById: result.updateTaskById.task
          }))
        }
      },

      // https://formidable.com/open-source/urql/docs/graphcache/cache-updates/#invalidating-entities
      deleteTaskById: (result, args, cache, info) => {
        if(result.deleteTaskById) {
          cache.updateQuery({ query: ListTasksDocument }, data => data ? {
            ...data,
            allTasksList: data.allTasksList.filter(
              obj => obj.id !== result.deleteTaskById.task.id
            )
          } : data)
        }
      }

    }

  },

  optimistic: {

    createTask: (variables, cache, info) => {
      if(!navigator.onLine && variables.input.task) {
        cache.updateQuery({ query: ListTasksDocument }, data => data ? {
          ...data,
          allTasksList: data.allTasksList
            .concat({
              ...variables.input.task,
              seq: 0,
              deleted: false,
              updated: new Date().toISOString(),
              type: 'Resource',
              __typename: 'Resource'
            })
            .sort(asc('name'))
        } : data)

        cache.updateQuery({
          query: DetailTaskDocument,
          variables: { id: variables.input.task.id }
        }, data => ({
          ...data,
          taskById: variables.input.task
        }))
      }
    },

    updateTaskById: (variables, cache, info) => ({
      __typename: "UpdateTaskPayload",
      task: {
        ...variables.input.taskPatch,
        __typename: 'Task'
      }
    }),

    deleteTaskById: (variables, cache, info) => {
      if(!navigator.onLine && variables.input.id) {
        cache.updateQuery({ query: ListTasksDocument }, data => data ? {
          ...data,
          allTasksList: data.allTasksList.filter(
            obj => obj.id !== variables.input.id
          )
        } : data)

        cache.updateQuery({
          query: DetailTaskDocument,
          variables: { id: variables.input.id }
        }, data => ({
          ...data,
          taskById: null
        }))
      }
    }

  }

}