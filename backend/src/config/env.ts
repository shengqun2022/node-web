import fp from 'fastify-plugin'
import fastifyEnv from '@fastify/env'
import type { FastifyPluginAsync } from 'fastify'

export type AppEnv = {
  NODE_ENV: 'development' | 'test' | 'production'
  HOST: string
  PORT: number
  LOG_LEVEL: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent'
  DATABASE_URL: string
}

const schema = {
  type: 'object',
  required: ['NODE_ENV', 'HOST', 'PORT', 'LOG_LEVEL', 'DATABASE_URL'],
  properties: {
    NODE_ENV: { type: 'string', enum: ['development', 'test', 'production'], default: 'development' },
    HOST: { type: 'string', default: '127.0.0.1' },
    PORT: { type: 'number', default: 3000 },
    LOG_LEVEL: {
      type: 'string',
      enum: ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'],
      default: 'info',
    },
    DATABASE_URL: { type: 'string' },
  },
} as const

declare module 'fastify' {
  interface FastifyInstance {
    env: AppEnv
  }
}

const envPlugin: FastifyPluginAsync = async (app) => {
  await app.register(fastifyEnv, {
    schema,
    dotenv: true,
    confKey: 'env',
  })
}

export default fp(envPlugin, { name: 'env' })

