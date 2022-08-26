import { readFileSync } from 'fs'
import { join, dirname } from 'pathe'
import { fileURLToPath } from 'url'
import { defineNuxtModule } from '@nuxt/kit'
import { access } from 'fs/promises'

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const appName = JSON.parse(readFileSync(join(appDir, 'package.json'))).name

const capitalize = str =>
  str.replace('@', '').replace('/', ',').toLowerCase().split(',').map(str => str.charAt(0).toUpperCase() + str.slice(1)).join('')

export default defineNuxtModule({
  name: appName,
  hooks: {
    // https://v3.nuxtjs.org/docs/directory-structure/components#library-authors
    async 'components:dirs'(dirs) {
      const path = join(appDir, 'components')

      try {
        await access(path)
        dirs.push({ path, prefix: capitalize(appName) })
      } catch(e) {
        console.warn(`No components found for "${appName}"`)
      }
    }
  }
})