import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { handleError } from '../utils/errorHandler'
import { IRating, Rating } from '../models/ratingModel'

export const createRating = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    await Rating.create(req.body)
    const result = await queryData<IRating>(Rating, req)
    res.status(200).json({
      message: 'Rating was created successfully',
      result,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const getRating = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const rating = await Rating.findOne({ username: req.params.username })
    if (!rating) {
      return res.status(200).json()
    } else {
      res.status(200).json({ data: rating })
    }
  } catch (error) {
    console.log(error)
    handleError(res, undefined, undefined, error)
  }
}

export const updateRating = async (req: Request, res: Response) => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    const rating = await Rating.findOneAndUpdate(
      { username: req.params.username },
      req.body,
      {
        new: true,
        runValidators: true,
        upsert: true,
      }
    )

    const result = await queryData<IRating>(Rating, req)
    res.status(200).json({
      message: 'The rating is updated successfully',
      data: rating,
      ...result
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getRatings = async (req: Request, res: Response) => {
  try {
    const result = await queryData<IRating>(Rating, req)
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const deleteReviews = async (req: Request, res: Response) => {
  try {
    const ids = req.body.ids
    for (let x = 0; x < ids.length; x++) {
      const id = ids[x];
      await Rating.findByIdAndDelete(id)
    }
    const result = await queryData<IRating>(Rating, req)
    res.status(200).json({ message: 'Rating report deleted successfully', ...result })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const searchRatings = (req: Request, res: Response) => {
  return search(Rating, req, res)
}
