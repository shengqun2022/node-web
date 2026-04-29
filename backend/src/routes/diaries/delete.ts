import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../../db/prisma.js'

type DeleteDiaryBody = {
  userId: string
}

const deleteDiaryRoutes: FastifyPluginAsync = async (app) => {
  app.delete(
    '/diaries/:id',
    {
      schema: {
        tags: ['diaries'],
        summary: 'Delete diary log',
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
          },
          required: ['userId'],
          additionalProperties: false,
        },
        response: {
          200: {
            type: 'object',
            properties: { ok: { type: 'boolean' } },
            required: ['ok'],
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
      const params = req.params as { id: string }
      const body = req.body as DeleteDiaryBody

      const deleted = await prisma.diary.deleteMany({
        where: { id: params.id, userId: body.userId },
      })

      if (deleted.count === 0) {
        return reply.status(404).send({
          code: 'DIARY_NOT_FOUND',
          message: '日记不存在',
        })
      }

      return reply.status(200).send({ ok: true })
    },
  )
}

export default deleteDiaryRoutes

