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

    const data = Array.isArray(req.body) ? req.body : [req.body]

    for (const item of data) {
      const feedId = item.feedId
      const consumptionAmount = Number(item.consumption || 0)
      const pro = await Product.findById(feedId)

      if (!pro) {
        // Skip or handle error? For bulk, skip and continue or fail all? 
        // Following operationController pattern: we assume validation happened on frontend.
        continue;
      }

      // 1) Stock Check: Prevent negative stock
      const productName = item.feed || pro.name
      if (!productName.toLowerCase().includes("water")) {
        const updateResult = await Product.updateOne(
          { _id: feedId, units: { $gte: consumptionAmount } },
          { $inc: { units: -1 * consumptionAmount } }
        )

        if (updateResult.modifiedCount === 0) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${pro.name}. Current stock: ${pro.units}, Required: ${consumptionAmount}` 
          })
        }
      }

      // 2) Empty Bag Logic with Purchase Unit Sync
      if (pro.type === 'Feed') {
        const bagUnits = consumptionAmount / (pro.unitPerPurchase || 1)
        const emptyBag = await Product.findOne({ pId: pro._id })
        if (emptyBag) {
          await Product.findByIdAndUpdate(emptyBag._id, {
            $inc: { units: bagUnits },
            picture: pro.picture,
            purchaseUnit: pro.purchaseUnit, 
          })
        } else {
          await Product.create({
            name: `Empty Bag of ${pro.name}`,
            pId: pro._id,
            units: bagUnits,
            unitPerPurchase: 1,
            type: 'General',
            isBuyable: true,
            picture: pro.picture,
            purchaseUnit: pro.purchaseUnit, 
          })
        }
      }
      
      if (!item._id) delete item._id
      item.amount = Number(pro.costPrice) * Number(item.consumption)
      item.unitPrice = Number(pro.costPrice)
      if (!item.type) item.type = pro.type
      
      const newConsumption = await Consumption.create(item)
      io.emit("consumption", { consumption: newConsumption })
    }

    const result = await queryData<IConsumption>(Consumption, req)
    res.status(200).json({
      message: data.length > 1 ? `${data.length} consumptions were created successfully` : 'Consumption was created successfully',
      result,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const deleteConsumption = async (req: Request, res: Response) => {
  try {
    const item = await Consumption.findById(req.params.id)
    if (!item) {
      return res.status(404).json({ message: 'Consumption not found' })
    }

    const feedId = item.feedId
    const consumptionAmount = Number(item.consumption || 0)
    const pro = await Product.findById(feedId)

    if (pro) {
      const productName = item.feed || pro.name
      if (!productName.toLowerCase().includes("water")) {
        // Reverse stock deduction
        await Product.findByIdAndUpdate(feedId, {
          $inc: { units: consumptionAmount },
        })
      }

      // Reverse Empty Bag Logic
      if (pro.type === 'Feed') {
        const emptyBag = await Product.findOne({ pId: pro._id })
        if (emptyBag) {
          const bagUnits = consumptionAmount / (pro.unitPerPurchase || 1)
          await Product.findByIdAndUpdate(emptyBag._id, {
            $inc: { units: -1 * bagUnits },
          })
        }
      }
    }

    await Consumption.findByIdAndDelete(req.params.id)
    const result = await queryData<IConsumption>(Consumption, req)

    res.status(200).json({
      message: 'The consumption is deleted successfully',
      result,
    })
  } catch (error) {
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
    const oldConsumption = await Consumption.findById(req.params.id)
    if (!oldConsumption) {
      return res.status(404).json({ message: 'Consumption not found' })
    }

    // Sync inventory if consumption amount changed
    if (req.body.consumption !== undefined) {
      const feedId = oldConsumption.feedId
      const oldAmount = Number(oldConsumption.consumption || 0)
      const newAmount = Number(req.body.consumption || 0)
      const diff = oldAmount - newAmount

      if (diff !== 0) {
        const pro = await Product.findById(feedId)
        if (pro) {
          const productName = oldConsumption.feed || pro.name
          if (!productName.toLowerCase().includes("water")) {
            // If decreasing stock (new > old, diff < 0), check availability
            if (diff < 0) {
              const amountToDeduct = Math.abs(diff)
              if (pro.units < amountToDeduct) {
                return res.status(400).json({ 
                  message: `Insufficient stock for ${pro.name}. Available: ${pro.units}` 
                })
              }
            }

            await Product.updateOne(
              { _id: feedId, ...(diff < 0 ? { units: { $gte: Math.abs(diff) } } : {}) },
              { $inc: { units: diff } }
            )
          }

          // Sync Empty Bag
          if (pro.type === 'Feed') {
            const emptyBag = await Product.findOne({ pId: pro._id })
            if (emptyBag) {
              const diffInBags = diff / (pro.unitPerPurchase || 1)
              await Product.updateOne(
                { _id: emptyBag._id, ...(diffInBags > 0 ? { units: { $gte: diffInBags } } : {}) },
                { $inc: { units: -diffInBags } }
              )
            }
          }
        }
      }
    }

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