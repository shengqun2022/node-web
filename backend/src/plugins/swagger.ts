import fp from 'fastify-plugin'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import type { FastifyPluginAsync } from 'fastify'

const swaggerPlugin: FastifyPluginAsync = async (app) => {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Fastify Backend',
        version: '0.1.0',
      },
    },
  })

  app.get(
    '/openapi.json',
    {
      schema: {
        tags: ['system'],
        summary: 'OpenAPI spec',
      },
    },
    async () => app.swagger(),
  )

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  })
}

export default fp(swaggerPlugin, { name: 'swagger' })

