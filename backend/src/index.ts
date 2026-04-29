import { buildApp } from './app.js'

const app = await buildApp()

try {
  await app.listen({ host: app.env.HOST, port: app.env.PORT })
  app.log.info(
    {
      host: app.env.HOST,
      port: app.env.PORT,
      docs: `http://${app.env.HOST}:${app.env.PORT}/docs`,
    },
    'server started',
  )
} catch (err) {
  app.log.error({ err }, 'failed to start server')
  process.exit(1)
}

