// @ts-ignore
import { computed } from 'vue'


export const useClear = (...args) => () => {
  args.forEach(ref => {
    ref.value = null
  })
}

export const useFocus = (autofocus, options: any = {}) => {
  const { selected, once } = options
  let focused = false

  return () => {
    if(autofocus.value && (!once || !focused)) {
      const input = autofocus.value.$el.querySelector('input')

      if(input.value.length) {
        input.setSelectionRange(selected ? 0 : input.value.length, input.value.length)
      }

      input.focus()

      focused = true
    }
  }
}

export const useSyncing = (...args) => computed(() => args.reduce((state, { value }) => state || value, false))

export const useSync = (data, model, path) => () => {
  if(data.value && data.value[path] && (!model.value.id || data.value[path].seq > model.value.seq)) {
    model.value = Object.assign(model.value, data.value[path])
  }
}