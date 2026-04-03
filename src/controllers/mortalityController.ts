import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { handleError } from '../utils/errorHandler'
import { IMortality, Mortality } from '../models/mortalityModel'
import { Product } from '../models/productModel'
import { io } from '../app'

export const createMortality = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    const productId = req.body.productId
    const quantity = Number(req.body.birds || 0)
    const livestock = await Product.findById(productId)

    if (!livestock) {
      return res.status(404).json({ message: 'Livestock product not found' })
    }

    // Stock Check
    if (livestock.units < quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock for ${livestock.name}. Current stock: ${livestock.units}, Mortality: ${quantity}` 
      })
    }

    // Decrement Stock
    await Product.findByIdAndUpdate(productId, {
      $inc: { units: -1 * quantity },
    })

    // Cracks Product Logic: if the product name includes 'egg', track cracked eggs
    if (livestock.name.toLowerCase().includes('egg')) {
      const cracksProduct = await Product.findOne({ pId: livestock._id })
      if (cracksProduct) {
        await Product.findByIdAndUpdate(cracksProduct._id, {
          $inc: { units: quantity },
          picture: livestock.picture,
          purchaseUnit: livestock.purchaseUnit,
          unitPerPurchase: livestock.unitPerPurchase,
        })
      } else {
        await Product.create({
          name: `Cracks`,
          pId: livestock._id,
          units: quantity,
          unitPerPurchase: livestock.unitPerPurchase || 1,
          type: 'General',
          isBuyable: true,
          picture: livestock.picture,
          purchaseUnit: livestock.purchaseUnit,
        })
      }
    }

    const mortality = await Mortality.create(req.body)
    const result = await queryData<IMortality>(Mortality, req)
    
    io.emit("mortality", { mortality })
    
    res.status(200).json({
      message: 'Mortality recorded successfully',
      result,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const getMortality = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const mortality = await Mortality.findById(req.params.id)
    if (!mortality) {
      return res.status(404).json({ message: 'Mortality record not found' })
    }
    res.status(200).json({ data: mortality })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const updateMortality = async (req: Request, res: Response) => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

    const mortality = await Mortality.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!mortality) {
      return res.status(404).json({ message: 'Mortality record not found' })
    }
    const result = await queryData<IMortality>(Mortality, req)
    res.status(200).json({
      message: 'Mortality record updated successfully',
      result,
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getMortalities = async (req: Request, res: Response) => {
  try {
    const result = await queryData<IMortality>(Mortality, req)
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const searchMortalities = (req: Request, res: Response) => {
  return search(Mortality, req, res)
}
