import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { handleError } from '../utils/errorHandler'
import { IMarketing, Marketing } from '../models/marketingModel'

export const createMarketing = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    await Marketing.create(req.body)
    const result = await queryData<IMarketing>(Marketing, req)
    res.status(200).json({
      message: 'Marketing was created successfully',
      result,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const getMarketing = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const marketing = await Marketing.findById(req.params.id)
    if (!marketing) {
      return res.status(404).json({ message: 'Marketing not found' })
    }

    res.status(200).json({ data: marketing })
  } catch (error) {
    console.log(error)
    handleError(res, undefined, undefined, error)
  }
}

export const updateMarketing = async (req: Request, res: Response) => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    const marketing = await Marketing.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
    if (!marketing) {
      return res.status(404).json({ message: 'Marketing not found' })
    }
    const result = await queryData<IMarketing>(Marketing, req)

    res.status(200).json({
      message: 'The Marketing is updated successfully',
      result,
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getMarketings = async (req: Request, res: Response) => {
  try {
    const result = await queryData<IMarketing>(Marketing, req)
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const deleteMarketing = async (req: Request, res: Response) => {
  try {
    const blog = await Marketing.findByIdAndDelete(req.params.id)
    if (!blog) {
      return res.status(404).json({ message: 'Marketing report not found' })
    }
    const result = await queryData<IMarketing>(Marketing, req)
    res.status(200).json({ message: 'Marketing report deleted successfully', ...result })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const searchMarketings = (req: Request, res: Response) => {
  return search(Marketing, req, res)
}
