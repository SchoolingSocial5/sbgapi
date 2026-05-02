import { Request } from 'express'

/**
 * Parses stringified JSON fields in req.body that should be objects or arrays.
 * This is useful when using FormData on the frontend with multer on the backend.
 */
export const parseJsonFields = (req: Request, fields: string[]) => {
  if (!req.body) return

  fields.forEach((field) => {
    if (req.body[field] && typeof req.body[field] === 'string') {
      try {
        const value = req.body[field].trim()
        if (value.startsWith('{') || value.startsWith('[')) {
          req.body[field] = JSON.parse(value)
        }
      } catch (e) {
        console.error(`Failed to parse JSON field "${field}":`, e)
      }
    }
  })
}
