import type { FastifyPluginAsync } from 'fastify'
import imageUploadRoutes from './image.js'
import fileUploadRoutes from './file.js'

const uploadRoutes: FastifyPluginAsync = async (app) => {
  await app.register(imageUploadRoutes)
  await app.register(fileUploadRoutes)
}

export default uploadRoutes

