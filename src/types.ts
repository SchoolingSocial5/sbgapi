// types/multer-s3.d.ts
declare namespace Express {
  namespace MulterS3 {
    interface File extends Multer.File {
      location: string // The S3 file URL
      key: string // The S3 object key
      bucket: string // The bucket name
      etag: string // The ETag from S3
    }
  }
}
