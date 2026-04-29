import type { FastifyPluginAsync } from 'fastify'
import createDiaryRoutes from './create.js'
import updateDiaryRoutes from './update.js'
import deleteDiaryRoutes from './delete.js'
import listDiaryRoutes from './list.js'

const diariesRoutes: FastifyPluginAsync = async (app) => {
  await app.register(createDiaryRoutes)
  await app.register(updateDiaryRoutes)
  await app.register(deleteDiaryRoutes)
  await app.register(listDiaryRoutes)
}

export default diariesRoutes

