import { defineEventHandler } from 'h3'
import Redis from 'ioredis'
import { useQuery } from 'h3'


export default defineEventHandler(async ({ req, res }) => {
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
        const users = value ? JSON.parse(value) : []

        users.push(useQuery(req).name)
        redis.set('users', JSON.stringify(users), (err) => {
          redis.disconnect()
          resolve(null)
        })
      })
    })

    redis.on('error', reject)
  })
})
