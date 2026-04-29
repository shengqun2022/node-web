import type { FastifyPluginAsync } from 'fastify'
import path from 'node:path'
import { saveMultipartFile } from './utils.js'

const fileUploadRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/upload/file',
    {
      schema: {
        tags: ['upload'],
        summary: '上传文件',
        consumes: ['multipart/form-data'],
        response: {
          200: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              urlPath: { type: 'string' },
              filename: { type: 'string' },
              mimetype: { type: 'string' },
            },
            required: ['url', 'urlPath', 'filename', 'mimetype'],
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
      const file = await (req as any).file()
      if (!file) {
        return reply.status(400).send({ code: 'INVALID_PARAMS', message: '请上传文件' })
      }

      const saved = await saveMultipartFile({
        req,
        file,
        uploadsDirAbs: path.join(process.cwd(), 'uploads'),
        urlPrefix: '/uploads',
      })

      return reply.status(200).send({
        url: saved.url,
        urlPath: saved.urlPath,
        filename: saved.storedFilename,
        mimetype: saved.mimetype,
      })
    },
  )
}

export default fileUploadRoutes

