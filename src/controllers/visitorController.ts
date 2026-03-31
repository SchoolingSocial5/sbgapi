import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { handleError } from '../utils/errorHandler'
import { IVisitor, Visitor } from '../models/visitorModel'

export const createVisitor = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    await Visitor.create(req.body)
    const result = await queryData<IVisitor>(Visitor, req)
    res.status(200).json({
      message: 'Visitor was created successfully',
      result,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const getVisitor = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const visitor = await Visitor.findOne({ username: req.params.username })
    if (!visitor) {
      return res.status(200).json()
    } else {
      res.status(200).json({ data: visitor })
    }
  } catch (error) {
    console.log(error)
    handleError(res, undefined, undefined, error)
  }
}

export const updateVisitor = async (req: Request, res: Response) => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    await Visitor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      upsert: true,
    })
    const result = await queryData<IVisitor>(Visitor, req)
    res.status(200).json({
      message: 'The Visitor is updated successfully',
      result,
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getVisitors = async (req: Request, res: Response) => {
  try {
    const result = await queryData<IVisitor>(Visitor, req)
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const searchVisitors = (req: Request, res: Response) => {
  return search(Visitor, req, res)
}
