import { defineEventHandler } from 'h3'

// @ts-ignore
import { useAuth, useOrigin } from '@codelaunch/core/composables/api.ts'


export default defineEventHandler(useAuth(useOrigin('localhost', async ({ req, res }) => {
  // Do extra user upsert logic/integration

  return {
    // Add extra user data for client
  }
})))
