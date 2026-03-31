import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { handleError } from '../utils/errorHandler'
import { Application, IApplication } from '../models/applicationModel'

export const createApplication = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const uploadedFiles = await uploadFilesToS3(req)
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url
        })

        await Application.create(req.body)
        const result = await queryData<IApplication>(Application, req)
        res.status(200).json({
            message: 'You application has been submitted successfully',
            result,
        })
    } catch (error: any) {
        handleError(res, undefined, undefined, error)
    }
}

export const getApplication = async (
    req: Request,
    res: Response
): Promise<Response | void> => {
    try {
        const application = await Application.findById(req.params.id)
        if (!application) {
            return res.status(404).json({ message: 'application not found' })
        }

        res.status(200).json({ data: application })
    } catch (error) {
        console.log(error)
        handleError(res, undefined, undefined, error)
    }
}

export const updateApplication = async (req: Request, res: Response) => {
    try {
        const uploadedFiles = await uploadFilesToS3(req)
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url
        })

        const application = await Application.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
        if (!application) {
            return res.status(404).json({ message: 'application not found' })
        }

        res.status(200).json({
            message: 'The application is updated successfully',
            data: application,
        })
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const getApplications = async (req: Request, res: Response) => {
    try {
        const result = await queryData<IApplication>(Application, req)
        res.status(200).json(result)
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const deleteApplication = async (req: Request, res: Response) => {
    try {
        const application = await Application.findByIdAndDelete(req.params.id)
        if (!application) {
            return res.status(404).json({ message: 'application not found' })
        }
        const result = await queryData<IApplication>(Application, req)
        res.status(200).json({ message: 'Application deleted successfully', ...result })
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const deleteApplications = async (req: Request, res: Response) => {
    try {
        const applications = req.body.selectedUsers
        for (const e of applications) {
            await Application.findByIdAndDelete(e._id)
        }
        const result = await queryData<IApplication>(Application, req)

        return res.status(207).json({
            message: 'The applications were deleted successfully.',
            result
        })
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const searchApplications = (req: Request, res: Response) => {
    return search(Application, req, res)
}
