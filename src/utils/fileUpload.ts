import AWS from 'aws-sdk'
import { Request, Response } from 'express'

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})

interface S3UploadResult {
  fieldName: string
  s3Url: string
}

interface CustomRequest extends Request {
  files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[]
}

export async function uploadFilesToS3(
  req: CustomRequest
): Promise<S3UploadResult[]> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME

  if (!bucketName) {
    throw new Error('S3 bucket name is not defined in environment variables.')
  }

  if (!req.files) {
    return Promise.all([])
  }

  const uploadPromises: Promise<S3UploadResult>[] = []

  if (Array.isArray(req.files)) {
    for (const singleFile of req.files) {
      const uploadPromise = uploadToS3(
        singleFile,
        bucketName,
        singleFile.fieldname
      )
      uploadPromises.push(uploadPromise)
    }
  } else if (typeof req.files === 'object') {
    for (const fieldName in req.files) {
      const files = req.files[fieldName]

      if (Array.isArray(files)) {
        for (const singleFile of files) {
          const uploadPromise = uploadToS3(singleFile, bucketName, fieldName)
          uploadPromises.push(uploadPromise)
        }
      }
    }
  }

  return Promise.all(uploadPromises)
}

export async function uploadToS3(
  file: Express.Multer.File,
  bucketName: string,
  fieldName: string
): Promise<S3UploadResult> {
  const uploadParams = {
    Bucket: bucketName,
    Key: `${Date.now()}_${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  }
  try {
    const data = await s3.upload(uploadParams).promise()

    return {
      fieldName,
      s3Url: data.Location,
    }
  } catch (error) {
    console.error('S3 upload failed:', error)
    throw new Error(`Failed to upload file to S3: ${error}`)
  }
}

export const getPresignedUrl = async (req: Request, res: Response) => {
  try {
    const { fileName, fileType } = req.body // Get file name & type from frontend

    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'Missing fileName or fileType' })
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME
    if (!bucketName) {
      return res
        .status(500)
        .json({ error: 'S3 bucket name is not set in environment variables' })
    }

    // ✅ Generate a unique file name
    const s3Params = {
      Bucket: bucketName,
      Key: `uploads/${Date.now()}_${fileName}`,
      ContentType: fileType,
      Expires: 300, // URL expires in 5 minutes
    }

    const uploadUrl = await s3.getSignedUrlPromise('putObject', s3Params)

    return res.json({ uploadUrl })
  } catch (error) {
    console.error('❌ Error generating presigned URL:', error)
    return res.status(500).json({ error: 'Failed to generate upload URL' })
  }
}

export const removeFile = async (req: Request, res: Response) => {
  const { fileKey } = req.body

  if (!fileKey) {
    return res.status(400).json({ error: 'File key is required' })
  }

  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME
    if (!bucketName) {
      return res
        .status(500)
        .json({ error: 'S3 bucket name is not set in environment variables' })
    }
    await s3
      .deleteObject({
        Bucket: bucketName,
        Key: fileKey,
      })
      .promise()

    res.json({ success: true })
  } catch (error) {
    console.error('S3 Deletion Error:', error)
    res.status(500).json({ error: 'Failed to delete file' })
  }
}

export const deleteFileFromS3 = async (url: string): Promise<void> => {
  if (!url) return

  const bucketName = process.env.AWS_S3_BUCKET_NAME || ''
  const fileKey = url.split(`${bucketName}/`)[1]

  if (!fileKey) return

  const deleteParams = {
    Bucket: bucketName,
    Key: fileKey,
  }

  await s3.deleteObject(deleteParams).promise()
}

export const deleteFilesFromS3 = async (
  modelInstance: any,
  fields: string[]
): Promise<void> => {
  const keysToDelete = fields
    .map((field) => modelInstance[field])
    .filter((key) => key)

  if (keysToDelete.length > 0) {
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME || '',
      Delete: {
        Objects: keysToDelete.map((Key) => ({ Key })),
      },
    }

    await s3.deleteObjects(deleteParams).promise()
  }
}

// export async function socketUploadFilesToS3(
//   media: { name: string; type: string; data: string }[]
// ): Promise<S3UploadResult[]> {
//   const bucketName = process.env.AWS_S3_BUCKET_NAME;

//   if (!bucketName) {
//     throw new Error("S3 bucket name is not defined in environment variables.");
//   }

//   if (!media || !Array.isArray(media) || media.length === 0) {
//     return [];
//   }

//   const uploadPromises: Promise<S3UploadResult>[] = media.map(async (file) => {
//     const base64Data = file.data.split(",")[1];
//     const buffer = Buffer.from(base64Data, "base64");

//     const multerFile: Express.Multer.File = {
//       buffer,
//       originalname: file.name,
//       mimetype: file.type,
//       fieldname: "media",
//       encoding: "",
//       size: buffer.length,
//       destination: "",
//       filename: "",
//       path: "",
//       stream: null as any,
//     };

//     return uploadToS3(multerFile, bucketName, multerFile.fieldname);
//   });

//   return Promise.all(uploadPromises);
// }
