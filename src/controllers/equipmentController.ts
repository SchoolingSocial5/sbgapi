import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { handleError } from '../utils/errorHandler'
import { IEquipment, Equipment } from '../models/equipmentModel'

export const createEquipment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    await Equipment.create(req.body)
    const result = await queryData<IEquipment>(Equipment, req)
    res.status(200).json({
      message: 'Equipment was created successfully',
      result,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const getEquipment = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const equipment = await Equipment.findOne({ username: req.params.username })
    if (!equipment) {
      return res.status(200).json()
    } else {
      res.status(200).json({ data: equipment })
    }
  } catch (error) {
    console.log(error)
    handleError(res, undefined, undefined, error)
  }
}

export const updateEquipment = async (req: Request, res: Response) => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      upsert: true,
    })
    const result = await queryData<IEquipment>(Equipment, req)
    res.status(200).json({
      message: 'The Equipment is updated successfully',
      result,
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getEquipments = async (req: Request, res: Response) => {
  try {
    const result = await queryData<IEquipment>(Equipment, req)
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const searchEquipments = (req: Request, res: Response) => {
  return search(Equipment, req, res)
}
