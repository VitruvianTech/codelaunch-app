import PrimeVue from 'primevue/config'
import Editor from 'primevue/editor'
// import Tooltip from 'primevue/tooltip'
// import Dialog from 'primevue/dialog'
// import DialogService from 'primevue/dialogservice'
// import ToastService from 'primevue/toastservice'
// import ConfirmationService from 'primevue/confirmationservice'
// import { useDialog } from 'primevue/usedialog'
// import { useToast } from 'primevue/usetoast'
// import { useConfirm } from 'primevue/useconfirm'

import 'primevue/resources/themes/saga-blue/theme.css'
import 'primevue/resources/primevue.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

export default async (app, context) => {
  app.use(PrimeVue, { ripple: true })
  app.component('PrimeVueEditor', Editor)
  // app.component('PrimeVueDialog', Dialog)
  // app.directive('primeVueTooltip', Tooltip)
  // app.provide('usePrimeVueDialog', useDialog)
  // app.provide('usePrimeVueToast', useToast)
  // app.provide('usePrimeVueConfirm', useConfirm)
  // app.use(DialogService)
  // app.use(ToastService)
  // app.use(ConfirmationService)
}
