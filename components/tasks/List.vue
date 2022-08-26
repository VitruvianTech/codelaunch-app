<template>
  <div v-if="data && data.allTasksList">
    <DataTable
      v-if="data.allTasksList.length"
      class="border-round shadow-2"
      :value="data.allTasksList"
      :rowClass="styleRow"
      sortField="name"
      stripedRows
      v-model:expandedRows="expanded"
      dataKey="id"
      responsiveLayout="scroll"
      @rowExpand="expandRow"
      @rowCollapse="collapseRow">
      <template #footer>
        <div class="table-header-container flex justify-content-end">
          <button class="icon px-1" size="small" @click="expandRows" type="button">
            <i class="text-sm text-blue-500 pi pi-plus" />
            <span>Expand</span>
          </button>
          <button class="icon px-1" size="small" @click="collapseRows" type="button">
            <i class="text-sm text-blue-500 pi pi-minus" />
            <span>Collapse</span>
          </button>
        </div>
      </template>
      <Column :expander="true" class="px-2" />
      <Column field="name" header="Name" sortable>
        <template #body="slotProps">
          <NuxtLink :to="`/admin/tasks/${slotProps.data.id}`" v-text="slotProps.data.name" />
        </template>
      </Column>
      <Column field="updated" header="Updated" sortable>
        <template #body="slotProps">
          <span class="text-xs text-500">{{datetime(slotProps.data.updated).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }) }}</span>
        </template>
      </Column>
      <Column class="text-right white-space-nowrap">
        <template #body="slotProps">
          <div class="p-2">
            <v-btn
              @click="detailDialogs[slotProps.data.id] = true"
              :icon="editable ? mdiPencil : mdiEye"
              size="x-small"
              flat />
            <v-btn
              @click="deleteDialogs[slotProps.data.id] = true"
              :icon="mdiDelete"
              :disabled="deleting || fetching || stale"
              v-if="deletable"
              size="x-small"
              flat />
          </div>
          <client-only>
            <v-dialog
              fullscreen
              transition="slide-x-transition"
              v-model="detailDialogs[slotProps.data.id]">
              <v-card>
                <v-toolbar color="primary" dark>
                  <v-toolbar-title>{{editable ? 'Edit Task' : 'Task' }}</v-toolbar-title>
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn :icon="mdiDotsVertical" v-bind="props" />
                    </template>
                    <v-list>
                      <v-list-item>
                        <v-list-item-title @click="router && router.push({ path: `/admin/tasks/${slotProps.data.id}` }), detailDialogs[slotProps.data.id] = false">View Details</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                  <v-btn @click="detailDialogs[slotProps.data.id] = false" :icon="mdiClose" />
                </v-toolbar>
                <v-card-text>
                  <Detail
                    @completed="detailDialogs[slotProps.data.id] = false"
                    :id="slotProps.data.id"
                    :editable="editable"
                    :deletable="deletable" />
                </v-card-text>
              </v-card>
            </v-dialog>
            <v-dialog
              v-if="deletable"
              v-model="deleteDialogs[slotProps.data.id]">
              <v-card title="Delete Task">
                <v-card-text>
                  <span>Are you sure you want to delete <strong>{{slotProps.data.name}}</strong>?</span>
                  <div v-if="deleteError" class="mt-4">
                    <span class="tip text-red-600 bg-red-100">{{deleteError}}</span>
                  </div>
                </v-card-text>
                <v-card-actions>
                  <v-col>
                    <v-btn
                      @click="remove(slotProps.data), deleteDialogs[slotProps.data.id] = false"
                      color="error"
                      autofocus>
                      {{ deleteError ? 'Retry' : 'Confirm' }}
                    </v-btn>
                    <v-btn @click="deleteDialogs[slotProps.data.id] = false">Cancel</v-btn>
                  </v-col>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </client-only>
        </template>
      </Column>
      <template #expansion="slotProps">
        <div class="text-sm orders-subtable p-3 bg-blue-50" style="margin:-.5em;">
          <div><strong>Sequence:</strong> {{slotProps.data.seq}}</div>
          <div><strong>ID:</strong> {{slotProps.data.id}}</div>
        </div>
      </template>
    </DataTable>
    <v-alert v-else type="info" variant="tonal" border="start">No records found</v-alert>
  </div>
  <client-only>
    <div class="mt-4">
      <div v-if="deleting || fetching || stale" class="tip text-yellow-700 bg-yellow-100"><i class="text-xs pi pi-sync pi-spin" /> Syncing...</div>
      <div v-if="error" class="tip text-red-600 bg-red-100">{{error}}</div>
    </div>
  </client-only>
</template>

<script setup>
import { ref, toRefs, inject } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { datetime } from '@codelaunch/app/lib/utils'
import Detail from '@codelaunch/app/components/tasks/Detail'

import {
  useListTasksQuery,
  useDeleteTaskMutation
} from 'gql'

import {
  mdiClose,
  mdiEye,
  mdiPencil,
  mdiDelete,
  mdiDotsVertical
} from '@mdi/js'


const props = defineProps({
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
  editable: { value: editable },
  deletable: { value: deletable }
} = toRefs(props)

const { fetching: deleting, error: deleteError, executeMutation: deleteTaskMutation } = useDeleteTaskMutation()
const { fetching, stale, data, error, executeQuery: listTaskQuery } = useListTasksQuery()
const router = useRouter()
const snackbar = inject('snackbar', () => {})
const detailDialogs = ref({})
const deleteDialogs = ref({})
const expanded = ref([])

const remove = async data => {
  deleteDialogs[data.id] = true

  const { data: { deleteTaskById }, error } = await deleteTaskMutation({ id: data.id })

  if(error) {
    error.value = null
    deleteError.value = error
    snackbar({ text: `Attempt to delete task "${deleteTaskById.task.name}" encountered error: ${error}.` })
  } else {
    snackbar({ text: `Task "${deleteTaskById.task.name}" has been deleted.` })
  }
}

const expandRows = () => {
  expanded.value = data.value.allTasksList
}

const collapseRows = () => {
  expanded.value = null
}

const expandRow = (event) => {}

const collapseRow = (event) => {}

const styleRow = (data) => {}
</script>


<style scoped>
.tip {
  display: inline-block;
}

::v-deep(td) {
  padding: .5em!important;
  line-height: 1.25;
}

::v-deep(th) {
  padding: 1em .5em!important;
  font-size: .9em;
  line-height: 1;
}

::v-deep(.p-column-header-content) {
  justify-content: start;
}

::v-deep(.p-sortable-column-icon.pi.pi-fw):before {
  content: "\e99e";
}

::v-deep(.p-datatable-table) {
  width: 100%;
}

::v-deep(.p-button) {
  border-radius: 50%;
}

::v-deep(.p-highlight .p-column-title) {
  color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
}
</style>
