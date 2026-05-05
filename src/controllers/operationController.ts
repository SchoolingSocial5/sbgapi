import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { handleError } from '../utils/errorHandler'
import { IOperation, Operation } from '../models/operationModel'
import { Product } from '../models/productModel'
import { Consumption } from '../models/consumptionModel'

export const getPerformanceSummary = async (req: Request, res: Response) => {
    try {
        const { dateFrom, dateTo } = req.query as { dateFrom: string; dateTo: string }
        
        const filter: any = { operation: 'Production' }
        if (dateFrom && dateTo) {
            filter.createdAt = {
                $gte: new Date(dateFrom),
                $lte: new Date(dateTo)
            }
        }

        const operations = await Operation.find(filter).lean()
        
        const consumptionFilter: any = {}
        if (dateFrom && dateTo) {
            consumptionFilter.createdAt = {
                $gte: new Date(dateFrom),
                $lte: new Date(dateTo)
            }
        }
        const consumptions = await Consumption.find(consumptionFilter).lean()

        // Group by Date (YYYY-MM-DD) and Pen
        const summaryMap: Record<string, any> = {}

        operations.forEach(op => {
            const date = new Date(op.createdAt as any).toISOString().split('T')[0]
            const key = `${date}_${op.pen}`
            
            if (!summaryMap[key]) {
                summaryMap[key] = {
                    date,
                    pen: op.pen,
                    penId: op.penId,
                    staffNames: new Set([op.staffName]),
                    eggBreakdown: {}, // columnId -> units
                    totalManure: 0,
                    emptyBags: 0,
                    totalEggUnits: 0
                }
            } else {
                summaryMap[key].staffNames.add(op.staffName)
            }

            const target = summaryMap[key]
            
            // Handle Eggs
            if (op.productionData && op.productionData.length > 0) {
                op.productionData.forEach(data => {
                    const units = Number(data.units || 0)
                    target.eggBreakdown[data.columnId] = (target.eggBreakdown[data.columnId] || 0) + units
                    target.totalEggUnits += units
                })
            }

            // Handle Manure
            if (op.productName?.toLowerCase().includes('manure')) {
                target.totalManure += Number(op.quantity || 0)
            }
        })

        // Mix in Consumptions
        consumptions.forEach(c => {
            const date = new Date(c.createdAt as any).toISOString().split('T')[0]
            const key = `${date}_${c.pen}`
            
            if (summaryMap[key]) {
                summaryMap[key].emptyBags += Number(c.consumption || 0)
            } else {
                // If there's consumption but no production recorded yet for that pen/day
                summaryMap[key] = {
                    date,
                    pen: c.pen,
                    staffNames: new Set([c.staffName]),
                    eggBreakdown: {},
                    totalManure: 0,
                    emptyBags: Number(c.consumption || 0),
                    totalEggUnits: 0
                }
            }
        })

        const result = Object.values(summaryMap).map((item: any) => ({
            ...item,
            staffName: Array.from(item.staffNames).join(', '),
            staffNames: undefined // clean up
        })).sort((a: any, b: any) => b.date.localeCompare(a.date))

        res.status(200).json(result)
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

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
            // Automatically set type from product type if not provided
            if (item.productId && !item.type) {
                const pro = await Product.findById(item.productId)
                if (pro) item.type = pro.type
            }
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

        const oldOperation = await Operation.findById(req.params.id)
        if (!oldOperation) {
            return res.status(404).json({ message: 'Operation not found' })
        }

        // Sync inventory if production units changed
        if (oldOperation.productId && (req.body.productionData || req.body.quantity !== undefined)) {
            const oldProductionData: { columnId: string; name: string; units: number }[] = oldOperation.productionData || []
            const oldTotalUnits = oldProductionData.reduce((sum, entry) => sum + Number(entry.units || 0), 0) + Number(oldOperation.quantity || 0)
            
            const newProductionData: { columnId: string; name: string; units: number }[] = req.body.productionData || oldOperation.productionData || []
            const newTotalUnits = newProductionData.reduce((sum, entry) => sum + Number(entry.units || 0), 0) + Number(req.body.quantity !== undefined ? req.body.quantity : oldOperation.quantity || 0)
            
            const diff = newTotalUnits - oldTotalUnits
            
            if (diff !== 0) {
                const pro = await Product.findById(oldOperation.productId)
                if (pro) {
                    // Check if decreasing stock (diff < 0), ensure no negative result
                    if (diff < 0 && pro.units < Math.abs(diff)) {
                        return res.status(400).json({ 
                            message: `Insufficient stock to update operation for ${pro.name}. Available: ${pro.units}` 
                        })
                    }

                    await Product.findByIdAndUpdate(oldOperation.productId, {
                        $inc: { units: diff },
                    })

                    // Specialized Manure Bag Handling
                    if (oldOperation.productName?.toLowerCase().includes('manure') && oldOperation.unitName?.toLowerCase().includes('bag')) {
                        const bagName = `${oldOperation.unitName} of ${oldOperation.productName}`
                        const emptyBag = await Product.findOne({ name: bagName })
                        if (emptyBag) {
                            const oldQty = Number(oldOperation.quantity || 0)
                            const newQty = Number(req.body.quantity !== undefined ? req.body.quantity : oldOperation.quantity || 0)
                            const qtyDiff = newQty - oldQty
                            
                            if (qtyDiff !== 0) {
                                await Product.findByIdAndUpdate(emptyBag._id, {
                                    $inc: { units: qtyDiff },
                                })
                            }
                        }
                    }
                }
            }
        }

        const operation = await Operation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
        if (!operation) {
            return res.status(404).json({ message: 'Operation not found' })
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

export const deleteOperation = async (req: Request, res: Response) => {
    try {
        const item = await Operation.findById(req.params.id)
        if (!item) {
            return res.status(404).json({ message: 'Operation not found' })
        }

        // If it's a production record, reverse the stock update
        if (item.productId) {
            const productionData: { columnId: string; name: string; units: number }[] = item.productionData || []
            const totalUnits = productionData.reduce((sum, entry) => sum + Number(entry.units || 0), 0) + Number(item.quantity || 0)
            
            if (totalUnits > 0) {
                // Decrement product stock
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { units: -totalUnits },
                })

                // Specialized Manure Bag Handling
                if (item.productName?.toLowerCase().includes('manure') && item.unitName?.toLowerCase().includes('bag')) {
                    const bagName = `${item.unitName} of ${item.productName}`
                    const emptyBag = await Product.findOne({ name: bagName })
                    if (emptyBag) {
                        await Product.findByIdAndUpdate(emptyBag._id, {
                            $inc: { units: -Number(item.quantity) },
                        })
                    }
                }
            }
        }

        await Operation.findByIdAndDelete(req.params.id)
        const result = await queryData<IOperation>(Operation, req)

        res.status(200).json({
            message: 'The operation is deleted successfully',
            result,
        })
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const searchOperations = (req: Request, res: Response) => {
    return search(Operation, req, res)
}
