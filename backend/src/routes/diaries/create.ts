import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../../db/prisma.js'

type CreateDiaryBody = {
  userId: string
  title?: string | null
  content: string
  entryDate?: string
}

const createDiaryRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/diaries',
    {
      schema: {
        tags: ['diaries'],
        summary: 'Create diary log',
        body: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            title: {
              anyOf: [{ type: 'string', minLength: 1 }, { type: 'null' }],
            },
            content: { type: 'string' },
            entryDate: { type: 'string', format: 'date-time' },
          },
          required: ['userId', 'content'],
          additionalProperties: false,
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              title: { anyOf: [{ type: 'string' }, { type: 'null' }] },
              content: { type: 'string' },
              entryDate: { type: 'string' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
            required: ['id', 'userId', 'title', 'content', 'entryDate', 'createdAt', 'updatedAt'],
          },
          400: {
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
      const body = req.body as CreateDiaryBody

      let entryDate: Date | undefined
      if (body.entryDate !== undefined) {
        entryDate = new Date(body.entryDate)
        if (Number.isNaN(entryDate.getTime())) {
          return reply.status(400).send({
            code: 'INVALID_PARAMS',
            message: 'entryDate 必须是有效的日期时间字符串',
          })
        }
      }

      const data: {
        userId: string
        title?: string | null
        content: string
        entryDate?: Date
      } = { userId: body.userId, content: body.content }

      if (body.title !== undefined) data.title = body.title
      if (entryDate !== undefined) data.entryDate = entryDate

      const diary = await prisma.diary.create({
        data,
        select: {
          id: true,
          userId: true,
          title: true,
          content: true,
          entryDate: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return reply.status(200).send({
        id: diary.id,
        userId: diary.userId,
        title: diary.title,
        content: diary.content,
        entryDate: diary.entryDate.toISOString(),
        createdAt: diary.createdAt.toISOString(),
        updatedAt: diary.updatedAt.toISOString(),
      })
    },
  )
}

export default createDiaryRoutes

