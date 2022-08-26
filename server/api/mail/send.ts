import { defineEventHandler } from 'h3'
import Redis from 'ioredis'

// @ts-ignore
import mailer from "@sendgrid/mail"

// @ts-ignore
import { useOrigin } from '@codelaunch/core/composables/api.ts'


export default defineEventHandler(useOrigin('localhost', async ({ req, res }) => {
  return await new Promise((resolve, reject) => {
    const redis = new Redis(process.env.QUEUE_URL, {
      retryStrategy: function(times) {
        if (times <= 100) {
          return 200;
        }
      }
    })

    redis.once('ready', () => {
      redis.get('users', (err, value) => {
        const users = value || []

        console.log(JSON.stringify(mailer))
        console.log(users)

        redis.set('users', null, (err) => {
          redis.disconnect()
          resolve(users)
        })
      })
    })

    redis.on('error', reject)
  })
}))
