import { Request, Response } from 'express'
import { queryData } from '../utils/query'
import { handleError } from '../utils/errorHandler'
import { ITransaction, Transaction } from '../models/transactionModel'
import { IProduct, Product } from '../models/productModel'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { User } from '../models/users/userModel'
import { sendNotification } from '../utils/sendNotification'
import { io } from '../app'

export const purchaseProducts = async (req: Request, res: Response) => {
  try {
    const product = req.body.product
    await Product.findByIdAndUpdate(product._id, {
      $inc: { units: product.cartUnits * (product.unitPerPurchase || 1) },
    })
    await Transaction.create(req.body)

    const result = await queryData<IProduct>(Product, req)

    res.status(200).json({
      message: 'Product purchase has been successfully recorded.',
      result,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const updatePartPayment = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ username: req.body.username })
    const trx = await Transaction.findById(req.params.id)
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { partPayment: req.body.partPayment },
        status:
          trx.partPayment + Number(req.body.partPayment) >= trx.totalAmount,
      },
      { new: true }
    )

    let notificationResult = null

    if (transaction.status) {
      notificationResult = await sendNotification('completed', {
        user,
        transaction,
      })
    } else {
      notificationResult = await sendNotification('part_payment', {
        user,
        transaction,
      })
    }

    const result = await queryData<IProduct>(Product, req)
    res.status(200).json({
      message: 'The transaction has been created successfully.',
      result,
      transaction,
      notificationResult,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const createTrasanction = async (req: Request, res: Response) => {
  try {
    const uploadedFiles = await uploadFilesToS3(req)
    uploadedFiles.forEach((file) => {
      req.body[file.fieldName] = file.s3Url
    })
    const cartProducts = JSON.parse(req.body.cartProducts)
    req.body.cartProducts = JSON.parse(req.body.cartProducts)
    req.body.status = JSON.parse(req.body.status)
    req.body.isProfit = JSON.parse(req.body.isProfit)
    req.body.partPayment = JSON.parse(req.body.partPayment)

    if (!Array.isArray(cartProducts) || cartProducts.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }

    const productIds = cartProducts.map((p) => p._id)
    const dbProducts = await Product.find({ _id: { $in: productIds } })

    if (dbProducts.length !== productIds.length) {
      const missingIds = productIds.filter(
        (id) => !dbProducts.find((p) => p._id.toString() === id.toString())
      )
      return res.status(404).json({
        message: `Some products were not found: ${missingIds.join(', ')}`,
      })
    }

    const outOfStock: { name: string; available: number; requested: number }[] =
      []

    for (const cartItem of cartProducts) {
      const product = dbProducts.find(
        (p) => p._id.toString() === cartItem._id.toString()
      )
      if (!product) continue
      if (product.units < cartItem.cartUnits * cartItem.unitPerPurchase) {
        outOfStock.push({
          name: product.name,
          available: product.units,
          requested: cartItem.cartUnits,
        })
      }
    }

    if (outOfStock.length > 0) {
      return res.status(400).json({
        message:
          'Some items are out of stock. Please adjust your order and try again.',
        outOfStock,
      })
    }

    const bulkOps = cartProducts.map((cartItem) => ({
      updateOne: {
        filter: { _id: cartItem._id },
        update: {
          $inc: { units: -cartItem.cartUnits * cartItem.unitPerPurchase },
        },
      },
    }))

    await Product.bulkWrite(bulkOps)
    const sales = await Transaction.countDocuments()
    req.body.invoiceNumber = `PG-${req.body.invoiceNumber}${sales + 1}`
    const transaction = await Transaction.create(req.body)
    if (req.body.userId === '') {
      await User.findOneAndUpdate(
        { phone: req.body.phone },
        {
          username: req.body.username ? req.body.username : req.body.email,
          phone: req.body.phone,
          email: req.body.email,
          address: req.body.address,
          fullName: req.body.fullName,
        },
        { new: true, upsert: true }
      )
    }
    const user = await User.findOneAndUpdate(
      { phone: req.body.phone },
      {
        $inc: { totalPurchase: req.body.totalAmount },
      }
    )
    let notificationResult = null

    if (req.body.partPayment) {
      notificationResult = await sendNotification('credit', {
        user,
        transaction,
      })
    } else {
      notificationResult = await sendNotification('product_purchase', {
        user,
        transaction,
      })
    }

    if (req.body.from) {
      io.emit(`purchase`, {
        transaction,
        notification: notificationResult.notification,
        unread: notificationResult.unread,
      })
    }

    io.emit('transaction', { transaction })

    const result = await queryData<IProduct>(Product, req)
    res.status(200).json({
      message: 'The transaction has been created successfully.',
      result,
      transaction,
      notificationResult,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const massDeleteTrasanction = async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find({ _id: { $in: req.body.ids } })
    await Transaction.deleteMany({ _id: { $in: req.body.ids } })
    for (let x = 0; x < transactions.length; x++) {
      const tx = transactions[x]
      for (let i = 0; i < tx.cartProducts.length; i++) {
        const cart = tx.cartProducts[i]
        Product.findByIdAndUpdate(cart._id, {
          $inc: { units: cart.cartUnits * cart.unitPerPurchase },
        })
      }
    }

    const result = await queryData<ITransaction>(Transaction, req)
    res.status(200).json({
      message: 'The transactions has been deleted successfully.',
      result,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const getTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await queryData<ITransaction>(Transaction, req)
    res.status(200).json(result)
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const updateTransaction = async (req: Request, res: Response) => {
  try {
    await Transaction.findByIdAndUpdate(req.params.id, req.body)

    const result = await queryData<ITransaction>(Transaction, req)

    res.status(200).json({
      message: 'The transaction has been updated successfully.',
      result,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const GetTransactionSummary = async (req: Request, res: Response) => {
  try {
    const { dateFrom, dateTo } = req.query

    if (!dateFrom || !dateTo) {
      return res.status(400).json({ message: 'Date range is required' })
    }

    const from = new Date(String(dateFrom))
    const to = new Date(String(dateTo))

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' })
    }

    // --- 1️⃣ Determine time grouping based on range ---
    const diffDays = Math.ceil(
      (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
    )

    let groupBy: 'day' | 'week' | 'month' | 'year'
    if (diffDays <= 7) groupBy = 'day'
    else if (diffDays <= 30) groupBy = 'week'
    else if (diffDays <= 365) groupBy = 'month'
    else groupBy = 'year'

    // --- 2️⃣ Build group format ---
    let dateGroup: Record<string, any>
    switch (groupBy) {
      case 'day':
        dateGroup = {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        }
        break
      case 'week':
        dateGroup = {
          $concat: [
            { $toString: { $isoWeekYear: '$createdAt' } },
            '-W',
            { $toString: { $isoWeek: '$createdAt' } },
          ],
        }
        break
      case 'month':
        dateGroup = { $dateToString: { format: '%Y-%m', date: '$createdAt' } }
        break
      case 'year':
        dateGroup = { $dateToString: { format: '%Y', date: '$createdAt' } }
        break
    }

    // --- 3️⃣ Aggregate grouped data for the chart ---
    const summary = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: dateGroup,
          totalSales: {
            $sum: {
              $cond: [{ $eq: ['$isProfit', true] }, '$totalAmount', 0],
            },
          },
          totalPurchases: {
            $sum: {
              $cond: [{ $eq: ['$isProfit', false] }, '$totalAmount', 0],
            },
          },
        },
      },
      {
        $addFields: {
          profit: { $subtract: ['$totalSales', '$totalPurchases'] },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          totalSales: 1,
          totalPurchases: 1,
          profit: 1,
        },
      },
    ])

    // --- 4️⃣ Aggregate overall totals for the whole range ---
    const totals = await Transaction.aggregate([
      {
        $match: {
          createdAt: { $gte: from, $lte: to },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: {
              $cond: [{ $eq: ['$isProfit', true] }, '$totalAmount', 0],
            },
          },
          totalPurchases: {
            $sum: {
              $cond: [{ $eq: ['$isProfit', false] }, '$totalAmount', 0],
            },
          },
        },
      },
      {
        $addFields: {
          profit: { $subtract: ['$totalSales', '$totalPurchases'] },
        },
      },
      {
        $project: {
          _id: 0,
          totalSales: 1,
          totalPurchases: 1,
          profit: 1,
        },
      },
    ])

    res.status(200).json({
      groupBy,
      from,
      to,
      bars: summary, // for bar chart
      totals: totals[0] || { totalSales: 0, totalPurchases: 0, profit: 0 }, // for pie chart
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}
