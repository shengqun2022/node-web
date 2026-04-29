import Fastify from 'fastify'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import envPlugin from './config/env.js'
import { buildLoggerOptions } from './config/logger.js'
import swaggerPlugin from './plugins/swagger.js'
import routes from './routes/index.js'
import path from 'node:path'

export async function buildApp() {
  const preEnv = {
    NODE_ENV: (process.env.NODE_ENV ?? 'development') as 'development' | 'test' | 'production',
    HOST: process.env.HOST ?? '127.0.0.1',
    PORT: Number(process.env.PORT ?? 3000),
    LOG_LEVEL: (process.env.LOG_LEVEL ?? 'info') as
      | 'fatal'
      | 'error'
      | 'warn'
      | 'info'
      | 'debug'
      | 'trace'
      | 'silent',
    DATABASE_URL: process.env.DATABASE_URL ?? '',
  }

  const app = Fastify({
    logger: buildLoggerOptions(preEnv),
  })

  await app.register(envPlugin)

  await app.register(multipart, {
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
    },
  })

  await app.register(fastifyStatic, {
    root: path.join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
  })

  await app.register(swaggerPlugin)
  await app.register(routes, { prefix: '/api' })

  app.setErrorHandler(async (err, _req, reply) => {
    const e = err as any
    if (e?.validation) {
      const details = Array.isArray(e.validation)
        ? (e.validation as Array<{ message?: string; instancePath?: string }>).map((v) =>
            `${v.instancePath || ''} ${v.message || ''}`.trim(),
          )
        : undefined

      return reply.status(400).send({
        code: 'INVALID_PARAMS',
        message: '参数不合法',
        details,
      })
    }

    app.log.error({ err }, 'unhandled error')
    const maybeStatusCode = (err as { statusCode?: unknown }).statusCode
    const statusCode =
      typeof maybeStatusCode === 'number' && Number.isInteger(maybeStatusCode) ? maybeStatusCode : 500
    return reply.status(statusCode).send({
      error: 'Internal Server Error',
    })
  })

  return app
}

