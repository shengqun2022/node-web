import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../../db/prisma.js'

type GetUserInfoBody = {
  userId?: string
  syncId?: string
}

const getUserInfoRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/users/info',
    {
      schema: {
        tags: ['users'],
        summary: 'Get user info by id (syncId alias)',
        body: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            syncId: { type: 'string' },
          },
          additionalProperties: false,
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              avatar: { anyOf: [{ type: 'string' }, { type: 'null' }] },
              nickname: { anyOf: [{ type: 'string' }, { type: 'null' }] },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
            required: ['id', 'email', 'avatar', 'nickname', 'createdAt', 'updatedAt'],
          },
          400: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
            },
            required: ['code', 'message'],
          },
          404: {
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
      const body = req.body as GetUserInfoBody
      const id = body.userId ?? body.syncId

      if (!id) {
        return reply.status(400).send({
          code: 'INVALID_PARAMS',
          message: 'userId 或 syncId 必须提供',
        })
      }

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          avatar: true,
          nickname: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!user) {
        return reply.status(404).send({
          code: 'USER_NOT_FOUND',
          message: '用户不存在',
        })
      }

      return reply.status(200).send({
        id: user.id,
        email: user.email,
        avatar: user.avatar,
        nickname: user.nickname,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })
    },
  )
}

export default getUserInfoRoutes

