import type { FastifyPluginAsync } from 'fastify'
import rootRoutes from './root.js'
import usersRoutes from './users/index.js'
import diariesRoutes from './diaries/index.js'
import uploadRoutes from './uploads/index.js'

const routes: FastifyPluginAsync = async (app) => {
  await app.register(rootRoutes)
  await app.register(usersRoutes)
  await app.register(diariesRoutes)
  await app.register(uploadRoutes)
}

export default routes

