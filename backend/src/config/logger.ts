import type { LoggerOptions } from 'pino'
import type { AppEnv } from './env.js'

export function buildLoggerOptions(env: AppEnv): LoggerOptions {
  return {
    level: env.LOG_LEVEL,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie'],
      remove: true,
    },
  }
}

