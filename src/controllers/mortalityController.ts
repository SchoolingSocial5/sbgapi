import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { handleError } from '../utils/errorHandler'
import { IMortality, Mortality } from '../models/mortalityModel'
import { Product } from '../models/productModel'
import { Operation } from '../models/operationModel'
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

    // Stock Check & Pen validation for Livestock (Bypass if it's an Egg product)
    const isEggProduct = livestock.name.toLowerCase().includes('egg')
    if (livestock.type === 'Livestock' && !isEggProduct) {
      const staffPen = req.body.pen
      if (!staffPen || staffPen === "No Pen Assigned") {
        return res.status(400).json({ 
          message: 'You are not assigned to any Pen House. Operation aborted.' 
        })
      }

      // Check if this pen is in the distribution list
      const distributions = livestock.penDistributions || []
      const penEntry = distributions.find(d => d.penName === staffPen)

      if (!penEntry) {
        return res.status(400).json({
          message: `The assigned pen (${staffPen}) does not have this livestock distributed to it.`
        })
      }

      const updateResult = await Product.updateOne(
        { 
          _id: productId, 
          units: { $gte: quantity },
          "penDistributions": { $elemMatch: { penName: staffPen, units: { $gte: quantity } } }
        },
        { $inc: { units: -1 * quantity, "penDistributions.$[elem].units": -1 * quantity } },
        { arrayFilters: [{ "elem.penName": staffPen }] }
      )

      if (updateResult.modifiedCount === 0) {
        return res.status(400).json({ 
          message: `Insufficient stock in ${staffPen} for mortality record. Pen stock: ${penEntry.units}, Mortality: ${quantity}` 
        })
      }
    } else {
      // General item stock decrement
      const updateResult = await Product.updateOne(
        { _id: productId, units: { $gte: quantity } },
        { $inc: { units: -1 * quantity } }
      )

      if (updateResult.modifiedCount === 0) {
        return res.status(400).json({ 
          message: `Insufficient stock. Current stock: ${livestock.units}, Mortality: ${quantity}` 
        })
      }
    }

    // Cracks Product Logic: if the product name includes 'egg', track cracked eggs
    if (livestock.name.toLowerCase().includes('egg')) {
      const crackProduct = await Product.findOne({ pId: livestock._id, name: 'Cracks' })
      let finalProductId = ""
      
      if (crackProduct) {
        finalProductId = crackProduct._id
        await Product.findByIdAndUpdate(crackProduct._id, {
          $inc: { units: quantity },
          picture: livestock.picture,
          purchaseUnit: livestock.purchaseUnit,
          unitPerPurchase: livestock.unitPerPurchase,
        })
      } else {
        const newCrack = await Product.create({
          name: `Cracks`,
          pId: livestock._id,
          units: quantity,
          unitPerPurchase: livestock.unitPerPurchase || 1,
          type: 'General',
          isBuyable: true,
          picture: livestock.picture,
          purchaseUnit: livestock.purchaseUnit,
        })
        finalProductId = newCrack._id
      }

      // Automatically create a Production record for Cracks
      await Operation.create({
        operation: 'Production',
        productName: 'Cracks',
        productId: finalProductId,
        quantity: quantity,
        staffName: req.body.staffName,
        pen: req.body.pen,
        remark: `Automated production from ${livestock.name} damage recording`
      })
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
    const oldMortality = await Mortality.findById(req.params.id)
    if (!oldMortality) {
      return res.status(404).json({ message: 'Mortality record not found' })
    }

    // Sync inventory if birds count changed
    if (req.body.birds !== undefined) {
      const productId = oldMortality.productId
      const oldQuantity = Number(oldMortality.birds || 0)
      const newQuantity = Number(req.body.birds || 0)
      const diff = oldQuantity - newQuantity

      if (diff !== 0) {
        const livestock = await Product.findById(productId)
        if (livestock) {
          const isEggProduct = livestock.name.toLowerCase().includes('egg')
          const staffPen = oldMortality.pen

          if (livestock.type === 'Livestock' && !isEggProduct && staffPen) {
            // Decrementing (diff < 0), check stock
            if (diff < 0) {
              const penEntry = livestock.penDistributions?.find(d => d.penName === staffPen)
              if (!penEntry || penEntry.units < Math.abs(diff)) {
                return res.status(400).json({ message: `Insufficient stock in ${staffPen}` })
              }
            }

            await Product.updateOne(
              { 
                _id: productId, 
                ...(diff < 0 ? { units: { $gte: Math.abs(diff) }, "penDistributions": { $elemMatch: { penName: staffPen, units: { $gte: Math.abs(diff) } } } } : {})
              },
              { $inc: { units: diff, "penDistributions.$[elem].units": diff } },
              { arrayFilters: [{ "elem.penName": staffPen }] }
            )
          } else {
            // General decrement
            if (diff < 0 && livestock.units < Math.abs(diff)) {
              return res.status(400).json({ message: 'Insufficient stock' })
            }
            await Product.updateOne(
              { _id: productId, ...(diff < 0 ? { units: { $gte: Math.abs(diff) } } : {}) },
              { $inc: { units: diff } }
            )
          }
        }
      }
    }

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
