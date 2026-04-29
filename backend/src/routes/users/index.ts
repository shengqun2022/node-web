import type { FastifyPluginAsync } from 'fastify'
import authRoutes from './auth.js'
import loginRoutes from './login.js'
import profileRoutes from './profile.js'
import infoRoutes from './info.js'

const usersRoutes: FastifyPluginAsync = async (app) => {
  await app.register(authRoutes)
  await app.register(loginRoutes)
  await app.register(profileRoutes)
  await app.register(infoRoutes)
}

export default usersRoutes

