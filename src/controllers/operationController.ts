import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { handleError } from '../utils/errorHandler'
import { IOperation, Operation } from '../models/operationModel'
import { Product } from '../models/productModel'

export const createOperation = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const uploadedFiles = await uploadFilesToS3(req)
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url
        })

        const data = Array.isArray(req.body) ? req.body : [req.body]

        for (const item of data) {
            await Operation.create(item)

            // If a product is linked, sum production units and add to stock
            if (item.productId) {
                const productionData: { columnId: string; name: string; units: number }[] = item.productionData || []
                const totalUnits = productionData.reduce((sum, entry) => sum + Number(entry.units || 0), 0) + Number(item.quantity || 0)
                
                if (totalUnits > 0) {
                    const pro = await Product.findById(item.productId)
                    if (pro) {
                        // 1) Update base product stock
                        await Product.findByIdAndUpdate(item.productId, {
                            $inc: { units: totalUnits },
                        })

                        // 2) Specialized Manure Bag Handling
                        if (item.productName?.toLowerCase().includes('manure') && item.unitName?.toLowerCase().includes('bag')) {
                            const bagName = `${item.unitName} of ${item.productName}`
                            const emptyBag = await Product.findOne({ name: bagName })
                            if (emptyBag) {
                                await Product.findByIdAndUpdate(emptyBag._id, {
                                    $inc: { units: Number(item.quantity) },
                                    picture: pro.picture,
                                    costPrice: pro.costPrice,
                                    price: pro.price,
                                })
                            } else {
                                await Product.create({
                                    name: bagName,
                                    pId: pro._id,
                                    units: Number(item.quantity),
                                    unitPerPurchase: 1,
                                    type: 'General',
                                    isBuyable: true,
                                    isProducing: false,
                                    picture: pro.picture,
                                    purchaseUnit: item.unitName,
                                    costPrice: pro.costPrice,
                                    price: pro.price,
                                })
                            }
                        }
                    }
                }
            }
        }

        const result = await queryData<IOperation>(Operation, req)
        res.status(200).json({
            message: data.length > 1 ? `${data.length} operations were created successfully` : 'Operation was created successfully',
            result,
        })
    } catch (error: any) {
        handleError(res, undefined, undefined, error)
    }
}

export const getOperation = async (
    req: Request,
    res: Response
): Promise<Response | void> => {
    try {
        const operation = await Operation.findById(req.params.id)
        if (!operation) {
            return res.status(404).json({ message: 'operation not found' })
        }

        res.status(200).json({ data: operation })
    } catch (error) {
        console.log(error)
        handleError(res, undefined, undefined, error)
    }
}

export const updateOperation = async (req: Request, res: Response) => {
    try {
        const uploadedFiles = await uploadFilesToS3(req)
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url
        })

        const service = await Operation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
        if (!service) {
            return res.status(404).json({ message: 'service not found' })
        }
        const result = await queryData<IOperation>(Operation, req)

        res.status(200).json({
            message: 'The operation is updated successfully',
            result,
        })
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const getOperations = async (req: Request, res: Response) => {
    try {
        const result = await queryData<IOperation>(Operation, req)
        res.status(200).json(result)
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const searchOperations = (req: Request, res: Response) => {
    return search(Operation, req, res)
}
