import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { handleError } from '../utils/errorHandler'
import { ISocial, Social } from '../models/socialModel'

export const createSocial = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    await Social.create(req.body)
    const result = await queryData<ISocial>(Social, req)
    res.status(200).json({
      message: 'Social was created successfully',
      result,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const getSocial = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const social = await Social.findById(req.params.id)
    if (!social) {
      return res.status(404).json({ message: 'Social not found' })
    }

    res.status(200).json({ data: social })
  } catch (error) {
    console.log(error)
    handleError(res, undefined, undefined, error)
  }
}

export const updateSocial = async (req: Request, res: Response) => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    const social = await Social.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!social) {
      return res.status(404).json({ message: 'Social not found' })
    }
    const result = await queryData<ISocial>(Social, req)

    res.status(200).json({
      message: 'The Social is updated successfully',
      result,
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getSocials = async (req: Request, res: Response) => {
  try {
    const result = await queryData<ISocial>(Social, req)
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const deleteSocial = async (req: Request, res: Response) => {
  try {
    const blog = await Social.findByIdAndDelete(req.params.id)
    if (!blog) {
      return res.status(404).json({ message: 'Social report not found' })
    }
    const result = await queryData<ISocial>(Social, req)
    res.status(200).json({ message: 'Social report deleted successfully', ...result })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const searchSocials = (req: Request, res: Response) => {
  return search(Social, req, res)
}
