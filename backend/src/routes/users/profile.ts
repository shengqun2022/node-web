import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../../db/prisma.js'

type EditUserProfileBody = {
  userId: string
  avatar?: string | null
  nickname?: string | null
}

const profileRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/users/profile',
    {
      schema: {
        tags: ['users'],
        summary: 'Edit user profile',
        body: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            avatar: {
              anyOf: [{ type: 'string', minLength: 1 }, { type: 'null' }],
            },
            nickname: {
              anyOf: [{ type: 'string', minLength: 1 }, { type: 'null' }],
            },
          },
          required: ['userId'],
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
      const body = req.body as EditUserProfileBody

      const data: { avatar?: string | null; nickname?: string | null } = {}
      if (body.avatar !== undefined) data.avatar = body.avatar
      if (body.nickname !== undefined) data.nickname = body.nickname

      if (Object.keys(data).length === 0) {
        return reply.status(400).send({
          code: 'INVALID_PARAMS',
          message: '头像或昵称至少需要提供一个',
        })
      }

      try {
        const user = await prisma.user.update({
          where: { id: body.userId },
          data,
          select: {
            id: true,
            email: true,
            avatar: true,
            nickname: true,
            createdAt: true,
            updatedAt: true,
          },
        })

        return reply.status(200).send({
          id: user.id,
          email: user.email,
          avatar: user.avatar,
          nickname: user.nickname,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        })
      } catch (e: any) {
        if (e?.code === 'P2025') {
          return reply.status(404).send({
            code: 'USER_NOT_FOUND',
            message: '用户不存在',
          })
        }
        throw e
      }
    },
  )
}

export default profileRoutes

