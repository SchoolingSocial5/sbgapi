import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { handleError } from '../utils/errorHandler'
import { IOperation, Operation } from '../models/operationModel'

export const createOperation = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const uploadedFiles = await uploadFilesToS3(req)
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url
        })

        await Operation.create(req.body)
        const result = await queryData<IOperation>(Operation, req)
        res.status(200).json({
            message: 'Operation was created successfully',
            result,
        })
    } catch (error: any) {
        handleError(res, undefined, undefined, error)
    }
}

export const getOperation = async (
    req: Request,
    res: Response
): Promise<Response | void> => {
    try {
        const operation = await Operation.findById(req.params.id)
        if (!operation) {
            return res.status(404).json({ message: 'operation not found' })
        }

        res.status(200).json({ data: operation })
    } catch (error) {
        console.log(error)
        handleError(res, undefined, undefined, error)
    }
}

export const updateOperation = async (req: Request, res: Response) => {
    try {
        const uploadedFiles = await uploadFilesToS3(req)
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url
        })

        const service = await Operation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
        if (!service) {
            return res.status(404).json({ message: 'service not found' })
        }
        const result = await queryData<IOperation>(Operation, req)

        res.status(200).json({
            message: 'The operation is updated successfully',
            result,
        })
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const getOperations = async (req: Request, res: Response) => {
    try {
        const result = await queryData<IOperation>(Operation, req)
        res.status(200).json(result)
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const searchOperations = (req: Request, res: Response) => {
    return search(Operation, req, res)
}
