import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { handleError } from '../utils/errorHandler'
import { IStrategy, Strategy } from '../models/strategyModel'

export const createStrategy = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    req.body.strategies = JSON.parse(req.body.strategies)
    await Strategy.create(req.body)
    const result = await queryData<IStrategy>(Strategy, req)
    res.status(200).json({
      message: 'Strategy was created successfully',
      result,
    })
  } catch (error: any) {
    handleError(res, undefined, undefined, error)
  }
}

export const getStrategy = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const strategy = await Strategy.findById(req.params.id)
    if (!strategy) {
      return res.status(404).json({ message: 'Strategy not found' })
    }

    res.status(200).json({ data: strategy })
  } catch (error) {
    console.log(error)
    handleError(res, undefined, undefined, error)
  }
}

export const updateStrategy = async (req: Request, res: Response) => {
  try {
    const strategy = await Strategy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!strategy) {
      return res.status(404).json({ message: 'Strategy not found' })
    }
    const result = await queryData<IStrategy>(Strategy, req)

    res.status(200).json({
      message: 'The Strategy is updated successfully',
      result,
    })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const getStrategies = async (req: Request, res: Response) => {
  try {
    const result = await queryData<IStrategy>(Strategy, req)
    res.status(200).json(result)
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const deleteStrategy = async (req: Request, res: Response) => {
  try {
    const blog = await Strategy.findByIdAndDelete(req.params.id)
    if (!blog) {
      return res.status(404).json({ message: 'Strategy report not found' })
    }
    const result = await queryData<IStrategy>(Strategy, req)
    res.status(200).json({ message: 'Strategy report deleted successfully', ...result })
  } catch (error) {
    handleError(res, undefined, undefined, error)
  }
}

export const searchStrategies = (req: Request, res: Response) => {
  return search(Strategy, req, res)
}
