import { Request, Response } from 'express'
import { IProduct, IStocking, Product, Stocking } from '../models/productModel'
import { queryData, search } from '../utils/query'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { handleError } from '../utils/errorHandler'
import { io } from '../app'
import { parseJsonFields } from '../utils/body'

export const createProduct = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })
    parseJsonFields(req, ['penDistributions'])

    if (typeof req.body.penDistributions === 'string') {
      try {
        req.body.penDistributions = JSON.parse(req.body.penDistributions)
      } catch (e) {
        console.error("Error parsing penDistributions:", e)
      }
    }

    if (req.body.type === 'Livestock') {
      const distributions = req.body.penDistributions || []
      const totalUnits = Number(req.body.units) || 0
      const distributedUnits = distributions.reduce((sum: number, d: any) => sum + Number(d.units), 0)
      if (distributedUnits > totalUnits) {
        return res.status(400).json({ 
          message: `Total distributed units (${distributedUnits}) exceeds product quantity (${totalUnits})` 
        })
      }
    }

    await Product.create(req.body)
    const result = await queryData<IProduct>(Product, req)
    res.status(200).json({
      message: 'Product is created successfully',
      ...result,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const getAProduct = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'product not found' })
    }

    res.status(200).json({ data: product })
  } catch (error) {
    console.log(error)
    handleError(res, undefined, undefined, error)
  }
}

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })
    parseJsonFields(req, ['penDistributions'])

    if (typeof req.body.penDistributions === 'string') {
      try {
        req.body.penDistributions = JSON.parse(req.body.penDistributions)
      } catch (e) {
        console.error("Error parsing penDistributions:", e)
      }
    }

    if (req.body.type === 'Livestock' || req.body.isSelling) {
      const distributions = req.body.penDistributions || []
      let totalUnits = Number(req.body.units)
      
      if (isNaN(totalUnits) || totalUnits === 0) {
        const existingProduct = await Product.findById(req.params.id)
        totalUnits = existingProduct ? existingProduct.units : 0
      }

      const distributedUnits = distributions.reduce((sum: number, d: any) => sum + Number(d.units), 0)
      if (distributedUnits > totalUnits) {
        return res.status(400).json({ 
          message: `Total distributed units (${distributedUnits}) exceeds product quantity (${totalUnits})` 
        })
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!product) {
      return res.status(404).json({ message: 'product not found' })
    }
    const result = await queryData<IProduct>(Product, req)

    res.status(200).json({
      message: 'The product is updated successfully',
      ...result,
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getProducts = async (req: Request, res: Response) => {
  try {
    const result = await queryData<IProduct>(Product, req)
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    await Stocking.findOneAndDelete({ productId: req.params.id })
    const result = await queryData<IProduct>(Product, req)

    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const searchProducts = (req: Request, res: Response) => {
  return search(Product, req, res)
}

// export const postProductStock = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const isProfit = req.body.isProfit === true || req.body.isProfit === 'true'
//     const units = Number(req.body.units)

//     if (isNaN(units)) {
//       res.status(400).json({ message: 'Invalid units value' })
//     }

//     await Product.findByIdAndUpdate(req.body.productId, {
//       $inc: { units: isProfit ? units : -units },
//     })

//     const stocking = await Stocking.create(req.body)
//     const result = await queryData<IStocking>(Stocking, req)
//     io.emit("stocking", { stocking, production: stocking })
//     if (!isProfit) {
//       io.emit("motality", { stocking })

//     }
//     res.status(200).json({
//       message: 'Product stock record has been created successfully',
//       result,
//     })
//   } catch (error: any) {
//     handleError(res, undefined, undefined, error)
//   }
// }

export const postProductStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const isProfit =
      req.body.isProfit === true || req.body.isProfit === 'true'

    const units = Number(req.body.units)

    if (isNaN(units) || units <= 0) {
      res.status(400).json({ message: 'Invalid units value' })
      return
    }

    const product = await Product.findById(req.body.productId)

    if (!product) {
      res.status(404).json({ message: 'Product not found' })
      return
    }

    // ✅ Prevent stock going below 0
    if (!isProfit && product.units < units) {
      res.status(400).json({
        message: 'Insufficient stock available',
      })
      return
    }

    // ✅ Update safely
    await Product.findByIdAndUpdate(req.body.productId, {
      $inc: { units: isProfit ? units : -units },
    })

    if (req.body.parentProductId) {
      const stock = await Product.findById(req.body.parentProductId)
      const percent = req.body.units / (stock.units)
      await Product.findByIdAndUpdate(req.body.parentProductId, { percentageProduction: percent })
      req.body.percentageProduction = percent
      req.body.purchaseUnit = product.purchaseUnit
      req.body.unitPerPurchase = product.unitPerPurchase
    }

    const stocking = await Stocking.create(req.body)

    const result = await queryData<IStocking>(Stocking, req)

    io.emit('stocking', { stocking, production: stocking })

    if (!isProfit) {
      io.emit('motality', { stocking })
    }

    res.status(200).json({
      message: 'Product stock record has been created successfully',
      result,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const updateProductStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const isProfit = req.body.isProfit === true || req.body.isProfit === 'true'
    const units = Number(req.body.units)

    if (isNaN(units)) {
      res.status(400).json({ message: 'Invalid units value' })
    }

    await Product.findByIdAndUpdate(req.body.productId, {
      $inc: { units: isProfit ? units : -units },
    })

    await Stocking.create(req.body)
    const result = await queryData<IStocking>(Stocking, req)

    res.status(200).json({
      message: 'Product stock record has been created successfully',
      result,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const deleteProductStocking = async (req: Request, res: Response) => {
  try {
    const stock = await Stocking.findByIdAndDelete(req.params.id)
    if (!stock) {
      return res.status(404).json({ message: 'stock not found' })
    }
    await Product.findByIdAndUpdate(req.body.productId, {
      $inc: { units: stock.isProfit ? -stock.units : stock.units },
    })
    const result = await queryData<IStocking>(Stocking, req)

    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getProductStocks = async (req: Request, res: Response) => {
  try {
    const result = await queryData<IStocking>(Stocking, req)
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const transferLivestock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fromPenId, toPenId, toPenName, quantity, transferAs } = req.body
    const unitsToTransfer = Number(quantity)

    if (isNaN(unitsToTransfer) || unitsToTransfer <= 0) {
      res.status(400).json({ message: 'Invalid quantity' })
      return
    }

    const product = await Product.findById(req.params.id)
    if (!product) {
      res.status(404).json({ message: 'Product not found' })
      return
    }

    if (!product.penDistributions) {
      product.penDistributions = []
    }

    const fromDistribution = product.penDistributions.find(d => d.penId === fromPenId)
    if (!fromDistribution || fromDistribution.units < unitsToTransfer) {
      res.status(400).json({ message: 'Insufficient livestock in the source pen' })
      return
    }

    const targetName = transferAs ? transferAs.trim() : product.name

    if (targetName !== product.name) {
      // Inter-product transfer
      product.units -= unitsToTransfer
      fromDistribution.units -= unitsToTransfer
      if (fromDistribution.units === 0) {
        product.penDistributions = product.penDistributions.filter(d => d.penId !== fromPenId)
      }
      await product.save()

      let targetProduct = await Product.findOne({ name: targetName })
      
      if (targetProduct) {
        // Increment existing product
        targetProduct.units += unitsToTransfer
        if (!targetProduct.penDistributions) targetProduct.penDistributions = []
        let toDistribution = targetProduct.penDistributions.find(d => d.penId === toPenId)
        if (toDistribution) {
          toDistribution.units += unitsToTransfer
        } else {
          targetProduct.penDistributions.push({
            penId: toPenId,
            penName: toPenName,
            units: unitsToTransfer,
            dateOfBirth: fromDistribution.dateOfBirth
          })
        }
        await targetProduct.save()
      } else {
        // Create new product copying source traits
        const newProductData = { ...product.toObject() }
        delete (newProductData as any)._id
        delete (newProductData as any).createdAt
        delete (newProductData as any).updatedAt
        
        newProductData.name = targetName
        newProductData.units = unitsToTransfer
        newProductData.penDistributions = [{
          penId: toPenId,
          penName: toPenName,
          units: unitsToTransfer,
          dateOfBirth: fromDistribution.dateOfBirth
        }]
        
        await Product.create(newProductData)
      }
    } else {
      // Normal intra-product transfer
      fromDistribution.units -= unitsToTransfer
      let toDistribution = product.penDistributions.find(d => d.penId === toPenId)
      if (toDistribution) {
        toDistribution.units += unitsToTransfer
      } else {
        product.penDistributions.push({
          penId: toPenId,
          penName: toPenName,
          units: unitsToTransfer,
          dateOfBirth: fromDistribution.dateOfBirth
        })
      }

      if (fromDistribution.units === 0) {
        product.penDistributions = product.penDistributions.filter(d => d.penId !== fromPenId)
      }
      await product.save()
    }
    let returnProducts = [product]
    if (targetName !== product.name) {
      const createdTarget = await Product.findOne({ name: targetName })
      if (createdTarget) returnProducts.push(createdTarget)
    }

    res.status(200).json({
      message: 'Livestock transferred successfully',
      updatedProducts: returnProducts
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}