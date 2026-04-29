import type { FastifyPluginAsync } from 'fastify'

const rootRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/',
    {
      schema: {
        tags: ['system'],
        summary: 'Service info',
      },
    },
    async () => ({
      name: 'backend-fastify',
      env: app.env.NODE_ENV,
    }),
  )
}

export default rootRoutes

