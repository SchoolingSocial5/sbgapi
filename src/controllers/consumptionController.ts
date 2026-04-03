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
): Promise<Response | void> => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    const feedId = req.body.feedId
    const consumptionAmount = Number(req.body.consumption || 1)
    const pro = await Product.findById(feedId)

    if (!pro) {
      return res.status(404).json({ message: 'Product not found' })
    }

    // 1) Stock Check: Prevent negative stock
    const productName = req.body.feed || pro.name
    if (!productName.toLowerCase().includes("water")) {
      if (pro.units < consumptionAmount) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${pro.name}. Current stock: ${pro.units}, Required: ${consumptionAmount}` 
        })
      }

      await Product.findByIdAndUpdate(feedId, {
        $inc: { units: -1 * consumptionAmount },
      })
    }

    // 2) Empty Bag Logic with Purchase Unit Sync
    if (pro.type === 'Feed') {
      const emptyBag = await Product.findOne({ pId: pro._id })
      if (emptyBag) {
        await Product.findByIdAndUpdate(emptyBag._id, {
          $inc: { units: consumptionAmount },
          picture: pro.picture,
          purchaseUnit: pro.purchaseUnit, // Sync purchase unit
        })
      } else {
        await Product.create({
          name: `Empty Bag of ${pro.name}`,
          pId: pro._id,
          units: consumptionAmount,
          unitPerPurchase: 1,
          type: 'General',
          isBuyable: true,
          picture: pro.picture,
          purchaseUnit: pro.purchaseUnit, // Copy purchase unit from source
        })
      }
    }
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