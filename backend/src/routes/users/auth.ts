import type { FastifyPluginAsync } from 'fastify'
import bcrypt from 'bcryptjs'
import { prisma } from '../../db/prisma.js'

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/auth/register',
    {
      schema: {
        tags: ['auth'],
        summary: 'Register user',
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
          409: {
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

      const passwordHash = await bcrypt.hash(body.password, 12)

      try {
        const user = await prisma.user.create({
          data: { email, passwordHash },
          select: { id: true, email: true, createdAt: true },
        })

        return reply.status(200).send({
          id: user.id,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
        })
      } catch (e: any) {
        // Prisma unique constraint violation
        if (e?.code === 'P2002') {
          return reply.status(409).send({
            code: 'EMAIL_EXISTS',
            message: '该邮箱已注册',
          })
        }
        throw e
      }
    },
  )
}

export default authRoutes

