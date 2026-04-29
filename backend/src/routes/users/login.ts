import type { FastifyPluginAsync } from 'fastify'
import bcrypt from 'bcryptjs'
import { prisma } from '../../db/prisma.js'

const loginRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/login',
    {
      schema: {
        tags: ['login'],
        summary: 'Login',
        body: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8, maxLength: 72 },
          },
          required: ['email', 'password'],
          additionalProperties: false,
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              createdAt: { type: 'string' },
            },
            required: ['id', 'email', 'createdAt'],
          },
          400: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'array', items: { type: 'string' } },
            },
            required: ['code', 'message'],
          },
          401: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
            required: ['code', 'message'],
          },
        },
      },
    },
    async (req, reply) => {
      const body = req.body as { email: string; password: string }
      const email = body.email.trim().toLowerCase()

      try {
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, createdAt: true, passwordHash: true },
        })

        if (!user) {
          return reply.status(401).send({
            code: 'INVALID_CREDENTIALS',
            message: '邮箱或密码不正确',
          })
        }

        const ok = await bcrypt.compare(body.password, user.passwordHash)
        if (!ok) {
          return reply.status(401).send({
            code: 'INVALID_CREDENTIALS',
            message: '邮箱或密码不正确',
          })
        }

        return reply.status(200).send({
          id: user.id,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
        })
      } catch (e: any) {
        throw e
      }
    },
  )
}

export default loginRoutes

