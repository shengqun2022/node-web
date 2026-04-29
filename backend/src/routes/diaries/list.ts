import type { FastifyPluginAsync } from 'fastify'
import { prisma } from '../../db/prisma.js'

type ListDiariesBody = {
  userId: string
  page?: number
  pageSize?: number
  keyword?: string
}

const listDiariesRoutes: FastifyPluginAsync = async (app) => {
  const handler = async (req: any, reply: any) => {
    const body = req.body as ListDiariesBody
    const page = body.page ?? 1
    const pageSize = body.pageSize ?? 20
    const keyword = (body.keyword ?? '').trim()

    if (!body.userId) {
      return reply.status(400).send({
        code: 'INVALID_PARAMS',
        message: 'userId 必须提供',
      })
    }

    const where =
      keyword.length > 0
        ? {
            userId: body.userId,
            OR: [
              { title: { contains: keyword, mode: 'insensitive' } },
              { content: { contains: keyword, mode: 'insensitive' } },
            ],
          }
        : { userId: body.userId }

    const [total, diaries] = await Promise.all([
      prisma.diary.count({ where }),
      prisma.diary.findMany({
        where,
        orderBy: { entryDate: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          userId: true,
          title: true,
          content: true,
          entryDate: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ])

    return reply.status(200).send({
      page,
      pageSize,
      total,
      data: diaries.map((d) => ({
        id: d.id,
        userId: d.userId,
        title: d.title,
        content: d.content,
        entryDate: d.entryDate.toISOString(),
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      })),
    })
  }

  // 兼容旧接口（你之前的 /list），同时提供新的 /diaries/list
  app.post(
    '/diaries/list',
    {
      schema: {
        tags: ['diaries'],
        summary: 'List diaries (pagination + keyword)',
        body: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            page: { type: 'integer', minimum: 1, default: 1 },
            pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            keyword: { type: 'string' },
          },
          required: ['userId'],
          additionalProperties: false,
        },
      },
    },
    handler,
  )

  app.post(
    '/list',
    {
      schema: {
        tags: ['diaries'],
        summary: 'List diaries (legacy /list)',
        body: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            page: { type: 'integer', minimum: 1, default: 1 },
            pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            keyword: { type: 'string' },
          },
          required: ['userId'],
          additionalProperties: false,
        },
      },
    },
    handler,
  )
}

export default listDiariesRoutes

