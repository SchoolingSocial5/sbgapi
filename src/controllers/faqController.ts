import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { handleError } from '../utils/errorHandler'
import { Faq, IFaq } from '../models/faqModel'

export const createFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    await Faq.create(req.body)
    const result = await queryData<IFaq>(Faq, req)
    res.status(200).json({
      message: 'Faq was created successfully',
      result,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const getFaq = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const faq = await Faq.findById(req.params.id)
    if (!faq) {
      return res.status(404).json({ message: 'faq not found' })
    }

    res.status(200).json({ data: faq })
  } catch (error) {
    console.log(error)
    handleError(res, undefined, undefined, error)
  }
}

export const updateFaq = async (req: Request, res: Response) => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!faq) {
      return res.status(404).json({ message: 'faq not found' })
    }
    const result = await queryData<IFaq>(Faq, req)

    res.status(200).json({
      message: 'The faq is updated successfully',
      result,
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getFaqs = async (req: Request, res: Response) => {
  try {
    const result = await queryData<IFaq>(Faq, req)
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const searchFaqs = (req: Request, res: Response) => {
  return search(Faq, req, res)
}
