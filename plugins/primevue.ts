// @ts-ignore
import { defineComponent } from 'vue'
// @ts-ignore
import { defineNuxtPlugin } from '#app'
// @ts-ignore
import PrimeVue from 'primevue/config'
// // @ts-ignore
// import Tooltip from 'primevue/tooltip'
// // @ts-ignore
// import DialogService from 'primevue/dialogservice'
// // @ts-ignore
// import ToastService from 'primevue/toastservice'
// // @ts-ignore
// import ConfirmationService from 'primevue/confirmationservice'


export default defineNuxtPlugin(async ({ vueApp }) => {
  let Editor
  // let Dialog
  // let useDialog
  // let useToast
  // let useConfirm

  vueApp.use(PrimeVue, { ripple: true })

  if(typeof window === 'undefined') {
    Editor = defineComponent({})
    // Dialog = defineComponent({})
    // useDialog = () => {}
    // useToast = () => {}
    // useConfirm = () => {}
  } else {
    // @ts-ignore
    Editor = (await import('primevue/editor')).default
    // @ts-ignore
    // Dialog = (await import('primevue/dialog')).default
    // // @ts-ignore
    // useDialog = (await import('primevue/usedialog')).useDialog
    // // @ts-ignore
    // useToast = (await import('primevue/usetoast')).useToast
    // // @ts-ignore
    // useConfirm = (await import("primevue/useconfirm")).useConfirm
  }

  vueApp.component('PrimeVueEditor', Editor)
  // vueApp.component('PrimeVueDialog', Dialog)
  // vueApp.directive('primeVueTooltip', Tooltip)
  // vueApp.provide('usePrimeVueDialog', useDialog)
  // vueApp.provide('usePrimeVueToast', useToast)
  // vueApp.provide('usePrimeVueConfirm', useConfirm)
  // vueApp.use(DialogService)
  // vueApp.use(ToastService)
  // vueApp.use(ConfirmationService)
})
