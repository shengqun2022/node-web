import { pipeline } from 'node:stream/promises'
import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

export type SavedUpload = {
  storedFilename: string
  originalFilename: string
  mimetype: string
  urlPath: string
  url: string
}

export async function saveMultipartFile(opts: {
  req: any
  file: { file: NodeJS.ReadableStream; filename: string; mimetype: string }
  uploadsDirAbs: string
  urlPrefix: string
  allowedMimePrefix?: string // e.g. "image/"
}): Promise<SavedUpload> {
  const { req, file, uploadsDirAbs, urlPrefix, allowedMimePrefix } = opts

  if (allowedMimePrefix && !file.mimetype.startsWith(allowedMimePrefix)) {
    const err: any = new Error('UNSUPPORTED_FILE_TYPE')
    err.statusCode = 400
    throw err
  }

  await mkdir(uploadsDirAbs, { recursive: true })

  const ext = path.extname(file.filename).slice(0, 16) // basic guard
  const storedFilename = `${crypto.randomUUID()}${ext}`
  const absPath = path.join(uploadsDirAbs, storedFilename)

  await pipeline(file.file, createWriteStream(absPath))

  const host = String(req.headers?.host ?? '')
  const proto = String(req.headers?.['x-forwarded-proto'] ?? 'http')
  const origin = host ? `${proto}://${host}` : ''

  const urlPath = `${urlPrefix}/${storedFilename}`
  const url = origin ? `${origin}${urlPath}` : urlPath

  return {
    storedFilename,
    originalFilename: file.filename,
    mimetype: file.mimetype,
    urlPath,
    url,
  }
}

