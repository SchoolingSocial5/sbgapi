import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { handleError } from '../utils/errorHandler'
import { IConsumption, Consumption } from '../models/consumptionModel'
import { Product } from '../models/productModel'
import { io } from '../app'

export const createConsumption = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    const product = req.body.feed
    if (!product.toLowerCase().includes("water")) {
      await Product.findByIdAndUpdate(req.body.feedId, {
        $inc: { units: -1 * (req.body.consumption || 1) },
      })
    }

    const pro = await Product.findById(req.body.feedId)
    req.body.amount = Number(pro.costPrice) * Number(req.body.consumption)
    req.body.unitPrice = Number(pro.costPrice)
    const consumption = await Consumption.create(req.body)
    const result = await queryData<IConsumption>(Consumption, req)
    io.emit("consumption", { consumption })
    res.status(200).json({
      message: 'Consumption was created successfully',
      result,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const getConsumption = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const consumption = await Consumption.findById(req.params.id)
    if (!consumption) {
      return res.status(404).json({ message: 'Consumption not found' })
    }

    res.status(200).json({ data: consumption })
  } catch (error) {
    console.log(error)
    handleError(res, undefined, undefined, error)
  }
}

export const updateConsumption = async (req: Request, res: Response) => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    const consumption = await Consumption.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
    if (!consumption) {
      return res.status(404).json({ message: 'Consumption not found' })
    }
    const result = await queryData<IConsumption>(Consumption, req)

    res.status(200).json({
      message: 'The Consumption is updated successfully',
      result,
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getConsumptions = async (req: Request, res: Response) => {
  try {
    const result = await queryData<IConsumption>(Consumption, req)
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const searchConsumptions = (req: Request, res: Response) => {
  return search(Consumption, req, res)
}