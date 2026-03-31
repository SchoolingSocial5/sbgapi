import { Request, Response } from 'express'
import { IProduct, IStocking, Product, Stocking } from '../models/productModel'
import { queryData, search } from '../utils/query'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { handleError } from '../utils/errorHandler'
import { io } from '../app'

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

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

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })

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