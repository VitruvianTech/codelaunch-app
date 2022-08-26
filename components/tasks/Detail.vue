<template>
  <div v-if="error">
    <Html>
      <Head>
        <Title>Error - Task</Title>
      </Head>
    </Html>
    <v-alert type="error" prominent variant="tonal" border="start">{{error}}</v-alert>
  </div>
  <div v-else-if="id && !model.id && !stale">
    <Html>
      <Head>
        <Title>Not Found - Task</Title>
      </Head>
    </Html>
    <v-alert type="error" prominent variant="tonal" border="start">Record does not exist</v-alert>
  </div>
  <div v-else>
    <Html>
      <Head>
        <Title>{{data && data.taskById ? `${data.taskById.name} - Task` : 'Create Task'}}</Title>
      </Head>
    </Html>
    <v-alert
      v-if="!editable"
      border="start"
      density="compact"
      type="warning"
      variant="tonal"
      class="mb-2">
      You cannot edit this object
    </v-alert>
    <v-form
      @submit.prevent="save"
      v-if="!fetching"
      v-model="valid">
      <div class="field col-12 xl:col-6">
        <v-text-field
          v-if="editable"
          v-model="model.name"
          name="name"
          label="Task name"
          hint="The name of this task"
          ref="autofocus"
          persistent-hint
          required
          autofocus
          :disabled="stale || syncing"
          :counter="60"
          :rules="[
            v => !!v || 'Name is required',
            v => v.length <= 60 || 'Name must not be longer than 60 characters'
          ]" />
        <div v-else>
          <label class="block text-overline" for="name">Name</label>
          <span>{{model.name}}</span>
        </div>
      </div>
      <div class="col-12" v-if="editable">
        <v-btn
          @click="save"
          :disabled="!valid || syncing"
          type="submit"
          color="primary">
          Save
        </v-btn>
        <v-btn
          @click="deleteDialog = true"
          v-if="deletable && model.id"
          :disabled="syncing"
          class="ml-2"
          :icon="mdiDelete"
          variant="plain">
        </v-btn>
        <client-only>
          <v-dialog v-model="deleteDialog">
            <v-card title="Delete Task">
              <v-card-text>
                <span>Are you sure you want to delete <strong>{{data.taskById.name}}</strong>?</span>
                <div v-if="deleteError" class="mt-4">
                  <span class="tip text-red-600 bg-red-100">{{deleteError}}</span>
                </div>
              </v-card-text>
              <v-card-actions>
                <v-col>
                  <v-btn
                    @click="remove(), deleteDialog = false"
                    color="error"
                    autofocus>
                    {{ deleteError ? 'Retry' : 'Confirm' }}
                  </v-btn>
                  <v-btn @click="deleteDialog = false">Cancel</v-btn>
                </v-col>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </client-only>
      </div>
      <div class="col-12" v-if="model.id">
        <span class="text-xs text-500 block p-1 line-height-2">Last synced on {{datetime(model.updated).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) }} (sequence no. {{model.seq}})</span>
        <span class="text-xs text-500 block p-1 line-height-2">
          Reference ID: {{truncate(model.id)}}
          <client-only>
            <sup>
              <v-btn
                @click="copy(model.id)"
                style="margin: -5px;"
                :icon="mdiClipboardTextMultipleOutline"
                size="x-small"
                color="primary"
                variant="plain" />
            </sup>
          </client-only>
        </span>
      </div>
      <client-only>
        <div class="col-12">
          <div v-if="syncing" class="tip text-yellow-700 bg-yellow-100 mb-2">
            <i class="text-xs pi pi-sync pi-spin" /> Syncing...
          </div>
          <div v-if="createError" class="tip text-red-600 bg-red-100 mb-2">{{createError}}</div>
          <div v-if="updateError" class="tip text-red-600 bg-red-100 mb-2">{{updateError}}</div>
          <div v-if="deleteError" class="tip text-red-600 bg-red-100 mb-2">{{deleteError}}</div>
        </div>
      </client-only>
    </v-form>
  </div>
</template>

<script setup>
import { ref, toRefs, inject, watch, computed } from 'vue'
import { useSync, useSyncing, useFocus, useClear } from '@codelaunch/app/composables/forms'
import { uuid, truncate } from '@codelaunch/app/lib/id'
import { datetime } from '@codelaunch/app/lib/utils'

import {
  useDetailTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation
} from 'gql'

import {
  mdiDelete,
  mdiClipboardTextMultipleOutline
} from '@mdi/js'


const props = defineProps({
  id: String,
  editable: {
    type: Boolean,
    default: false
  },
  deletable: {
    type: Boolean,
    default: false
  }
})

const {
  id: { value: id },
  editable: { value: editable },
  deletable: { value: deletable }
} = toRefs(props)

const { fetching: creating, error: createError, executeMutation: createTaskMutation } = useCreateTaskMutation()
const { fetching: updating, error: updateError, executeMutation: updateTaskMutation } = useUpdateTaskMutation()
const { fetching: deleting, error: deleteError, executeMutation: deleteTaskMutation } = useDeleteTaskMutation()
const { fetching, stale, data, error, executeQuery: detailTaskQuery } = id
  ? useDetailTaskQuery({ variables: { id } })
  : { data: ref(null), error: ref(null), stale: ref(false), fetching: ref(false) }

const emit = defineEmits(['created', 'updated', 'deleted', 'completed'])
const snackbar = inject('snackbar', () => {})
const deleteDialog = ref(false)
const model = ref({})
const valid = ref(false)
const autofocus = ref(null)
const focus = useFocus(autofocus, { once: true })
const sync = useSync(data, model, 'taskById')
const syncing = useSyncing(stale, fetching, deleting, updating, creating)
const clear = useClear(error, createError, updateError, deleteError)

watch(data, focus, { flush: 'post', immediate: true })
watch(data, sync, { flush: 'post', immediate: true })

const create = async () => {
  const { data: { createTask }, error } = await createTaskMutation({
    data: {
      ...model.value,
      id: uuid(),
      name: model.value.name.trim(),
      updated: new Date().toISOString()
    }
  })

  if(error) {
    createError.value = error
  } else {
    emit('created', createTask.task)
    emit('completed', createTask.task)
    snackbar({
      text: `Task "${createTask.task.name}" has been created.`,
      link: {
        to: `/admin/tasks/${createTask.task.id}`,
        text: 'View details'
      }
    })
  }
}

const update = async () => {
  const { id } = model.value

  const { data: { updateTaskById }, error } = await updateTaskMutation({
    id,
    data: {
      ...model.value,
      __typename: undefined,
      name: model.value.name.trim(),
      updated: new Date().toISOString()
    }
  })

  if(error) {
    updateError.value = error
  } else {
    emit('updated', updateTaskById.task)
    emit('completed', updateTaskById.task)
    snackbar({
      text: `Task "${updateTaskById.task.name}" has been updated.`,
      link: {
        to: `/admin/tasks/${updateTaskById.task.id}`,
        text: 'View details'
      }
    })
  }
}

const remove = async () => {
  clear()

  const { data: { deleteTaskById }, error } = await deleteTaskMutation({ id: id })

  if(error) {
    deleteError.value = error
  } else {
    emit('deleted', deleteTaskById.task)
    emit('completed', deleteTaskById.task)
    // Use provide/inject for snackbar, as a very particular Graphcache/Vue issue arises:
    //
    // When delete mutation causes a client cache update, any component using/reading from the
    // same cache that it's mutating, will unmount the record, then Vue ends up unbinding event
    // handlers on unmount, therefore, the following emits have no handlers after the above
    // mutation is finished.
    //
    // Emits work normally when a delete mutates the cache of which a parent component isn't
    // currently reading from. This issue is mostly a case of deleting while rendering a list
    // component (that _this_ component is a child of) at the same time, for example.
    snackbar({ text: `Task "${deleteTaskById.task.name}" has been deleted.` })
  }
}

const save = () => {
  clear()
  id ? update() : create()
}

const copy = text => {
  globalThis.navigator.clipboard.writeText(text)
  snackbar({ text: `Copied to clipboard.` })
}
</script>