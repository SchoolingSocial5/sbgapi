import { Request, Response } from 'express'
import { handleError } from '../../utils/errorHandler'
import {
  Company,
  Position,
  Policy,
  IPolicy,
  IPosition,
} from '../../models/company/companyModel'
import {
  queryData,
  updateItem,
  createItem,
  deleteItem,
} from '../../utils/query'
import { User } from '../../models/users/userModel'
import { Transaction } from '../../models/transactionModel'
import { Product, Stocking } from '../../models/productModel'
import { Equipment } from '../../models/equipmentModel'
import { Activity } from '../../models/activityModel'

export const updateCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (req.body.id) {
      const company = await Company.findByIdAndUpdate(req.body.id, req.body, {
        upsert: true,
        new: true,
      })
      res.status(200).json({ company })
    } else {
      const company = await Company.create(req.body)
      res.status(200).json({ company })
    }
  } catch (error) {
    console.log(error)
  }
}

export const getCompanyById = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const item = await Company.findById(req.params.id)
    if (!item) {
      return res.status(404).json({ message: 'Company not found' })
    }
    res.status(200).json(item)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getCompany = async (req: Request, res: Response) => {
  try {
    const company = await Company.findOne()
    res.status(200).json({ company })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const resetRecord = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    await Transaction.deleteMany()
    await Activity.deleteMany()
    await Equipment.deleteMany()
    await Product.updateMany({}, { $set: { units: 0 } });
    await Stocking.updateMany({}, { $set: { units: 0, amount: 0 } });
    await User.updateMany({}, { $set: { totalPurchase: 0 } });

    res.status(200).json({ message: 'The records where all reset successfully.' })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

//-----------------TERMS & CONDITIONS--------------------//
export const createPolicy = async (
  req: Request,
  res: Response
): Promise<void> => {
  createItem(req, res, Policy, 'Policy was created successfully')
}

export const getPolicyById = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const item = await Policy.findById(req.params.id)
    if (!item) {
      return res.status(404).json({ message: 'Policy not found' })
    }
    res.status(200).json(item)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getPolcies = async (req: Request, res: Response) => {
  try {
    const result = await queryData<IPolicy>(Policy, req)
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const updatePolicy = async (req: Request, res: Response) => {
  try {
    updateItem(
      req,
      res,
      Policy,
      [],
      ['Policy not found', 'Policy was updated successfully']
    )
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const deletePolicy = async (req: Request, res: Response) => {
  try {
    const result = await deleteItem(
      req,
      res,
      Policy,
      [],
      'Policy was updated successfully'
    )
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

//-----------------POSITION--------------------//
export const createPosition = async (
  req: Request,
  res: Response
): Promise<void> => {
  createItem(req, res, Position, 'Position was created successfully')
}

export const getPositionById = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const item = await Position.findById(req.params.id)
    if (!item) {
      return res.status(404).json({ message: 'Position not found' })
    }
    res.status(200).json(item)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getPositions = async (req: Request, res: Response) => {
  try {
    const result = await queryData<IPosition>(Position, req)
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const updatePosition = async (req: Request, res: Response) => {
  try {
    updateItem(
      req,
      res,
      Position,
      [],
      ['Position not found', 'Position was updated successfully']
    )
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const deletePosition = async (req: Request, res: Response) => {
  try {
    const result = await deleteItem(
      req,
      res,
      Position,
      [],
      'Position was deleted successfully'
    )
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const deletePositions = async (req: Request, res: Response) => {
  try {
    const ids = req.body.ids
    for (const id of ids) {
      await Position.findByIdAndDelete(id)
    }
    const result = await queryData<IPosition>(Position, req)
    return res.status(207).json({
      message: 'The positions were deleted successfully.',
      ...result,
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}
