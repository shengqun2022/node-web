import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../../db/prisma.js'

type UpdateDiaryBody = {
  userId: string
  title?: string | null
  content?: string
}

const updateDiaryRoutes: FastifyPluginAsync = async (app) => {
  app.put(
    '/diaries/:id',
    {
      schema: {
        tags: ['diaries'],
        summary: 'Edit diary log',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
          additionalProperties: false,
        },
        body: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            title: {
              anyOf: [{ type: 'string', minLength: 1 }, { type: 'null' }],
            },
            content: { type: 'string' },
          },
          required: ['userId'],
          additionalProperties: false,
        },
      },
    },
    async (req, reply) => {
      const params = req.params as { id: string }
      const body = req.body as UpdateDiaryBody

      const data: { title?: string | null; content?: string } = {}
      if (body.title !== undefined) data.title = body.title
      if (body.content !== undefined) data.content = body.content

      if (Object.keys(data).length === 0) {
        return reply.status(400).send({
          code: 'INVALID_PARAMS',
          message: '标题或内容至少需要提供一个',
        })
      }

      const updated = await prisma.diary.updateMany({
        where: { id: params.id, userId: body.userId },
        data,
      })

      if (updated.count === 0) {
        return reply.status(404).send({
          code: 'DIARY_NOT_FOUND',
          message: '日记不存在',
        })
      }

      const diary = await prisma.diary.findUnique({
        where: { id: params.id },
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

      // updateMany + findUnique should always find; but keep it safe for type narrowing.
      if (!diary || diary.userId !== body.userId) {
        return reply.status(404).send({
          code: 'DIARY_NOT_FOUND',
          message: '日记不存在',
        })
      }

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

export default updateDiaryRoutes

