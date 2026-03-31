import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { handleError } from '../utils/errorHandler'
import { IService, Service } from '../models/serviceModel'

export const createService = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    await Service.create(req.body)
    const result = await queryData<IService>(Service, req)
    res.status(200).json({
      message: 'Service was created successfully',
      result,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const getService = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const service = await Service.findById(req.params.id)
    if (!service) {
      return res.status(404).json({ message: 'service not found' })
    }

    res.status(200).json({ data: service })
  } catch (error) {
    console.log(error)
    handleError(res, undefined, undefined, error)
  }
}

export const updateService = async (req: Request, res: Response) => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!service) {
      return res.status(404).json({ message: 'service not found' })
    }
    const result = await queryData<IService>(Service, req)

    res.status(200).json({
      message: 'The service is updated successfully',
      result,
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getServices = async (req: Request, res: Response) => {
  try {
    const result = await queryData<IService>(Service, req)
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const searchServices = (req: Request, res: Response) => {
  return search(Service, req, res)
}
