"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFilesFromS3 = exports.deleteFileFromS3 = exports.removeFile = exports.getPresignedUrl = void 0;
exports.uploadFilesToS3 = uploadFilesToS3;
exports.uploadToS3 = uploadToS3;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
function uploadFilesToS3(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const bucketName = process.env.AWS_S3_BUCKET_NAME;
        if (!bucketName) {
            throw new Error('S3 bucket name is not defined in environment variables.');
        }
        if (!req.files) {
            return Promise.all([]);
        }
        const uploadPromises = [];
        if (Array.isArray(req.files)) {
            for (const singleFile of req.files) {
                const uploadPromise = uploadToS3(singleFile, bucketName, singleFile.fieldname);
                uploadPromises.push(uploadPromise);
            }
        }
        else if (typeof req.files === 'object') {
            for (const fieldName in req.files) {
                const files = req.files[fieldName];
                if (Array.isArray(files)) {
                    for (const singleFile of files) {
                        const uploadPromise = uploadToS3(singleFile, bucketName, fieldName);
                        uploadPromises.push(uploadPromise);
                    }
                }
            }
        }
        return Promise.all(uploadPromises);
    });
}
function uploadToS3(file, bucketName, fieldName) {
    return __awaiter(this, void 0, void 0, function* () {
        const uploadParams = {
            Bucket: bucketName,
            Key: `${Date.now()}_${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        };
        try {
            const data = yield s3.upload(uploadParams).promise();
            return {
                fieldName,
                s3Url: data.Location,
            };
        }
        catch (error) {
            console.error('S3 upload failed:', error);
            throw new Error(`Failed to upload file to S3: ${error}`);
        }
    });
}
const getPresignedUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileName, fileType } = req.body; // Get file name & type from frontend
        if (!fileName || !fileType) {
            return res.status(400).json({ error: 'Missing fileName or fileType' });
        }
        const bucketName = process.env.AWS_S3_BUCKET_NAME;
        if (!bucketName) {
            return res
                .status(500)
                .json({ error: 'S3 bucket name is not set in environment variables' });
        }
        // ✅ Generate a unique file name
        const s3Params = {
            Bucket: bucketName,
            Key: `uploads/${Date.now()}_${fileName}`,
            ContentType: fileType,
            Expires: 300, // URL expires in 5 minutes
        };
        const uploadUrl = yield s3.getSignedUrlPromise('putObject', s3Params);
        return res.json({ uploadUrl });
    }
    catch (error) {
        console.error('❌ Error generating presigned URL:', error);
        return res.status(500).json({ error: 'Failed to generate upload URL' });
    }
});
exports.getPresignedUrl = getPresignedUrl;
const removeFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileKey } = req.body;
    if (!fileKey) {
        return res.status(400).json({ error: 'File key is required' });
    }
    try {
        const bucketName = process.env.AWS_S3_BUCKET_NAME;
        if (!bucketName) {
            return res
                .status(500)
                .json({ error: 'S3 bucket name is not set in environment variables' });
        }
        yield s3
            .deleteObject({
            Bucket: bucketName,
            Key: fileKey,
        })
            .promise();
        res.json({ success: true });
    }
    catch (error) {
        console.error('S3 Deletion Error:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});
exports.removeFile = removeFile;
const deleteFileFromS3 = (url) => __awaiter(void 0, void 0, void 0, function* () {
    if (!url)
        return;
    const bucketName = process.env.AWS_S3_BUCKET_NAME || '';
    const fileKey = url.split(`${bucketName}/`)[1];
    if (!fileKey)
        return;
    const deleteParams = {
        Bucket: bucketName,
        Key: fileKey,
    };
    yield s3.deleteObject(deleteParams).promise();
});
exports.deleteFileFromS3 = deleteFileFromS3;
const deleteFilesFromS3 = (modelInstance, fields) => __awaiter(void 0, void 0, void 0, function* () {
    const keysToDelete = fields
        .map((field) => modelInstance[field])
        .filter((key) => key);
    if (keysToDelete.length > 0) {
        const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME || '',
            Delete: {
                Objects: keysToDelete.map((Key) => ({ Key })),
            },
        };
        yield s3.deleteObjects(deleteParams).promise();
    }
});
exports.deleteFilesFromS3 = deleteFilesFromS3;
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
