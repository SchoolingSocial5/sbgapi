import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { handleError } from '../utils/errorHandler'
import { IColumn, Column } from '../models/columnModel'

export const createColumn = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        await Column.create(req.body)
        const result = await queryData<IColumn>(Column, req)
        res.status(200).json({
            message: 'Column was created successfully',
            result,
        })
    } catch (error: any) {
        handleError(res, undefined, undefined, error)
    }
}

export const getColumn = async (
    req: Request,
    res: Response
): Promise<Response | void> => {
    try {
        const column = await Column.findById(req.params.id)
        if (!column) {
            return res.status(404).json({ message: 'Column not found' })
        }

        res.status(200).json({ data: column })
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const updateColumn = async (req: Request, res: Response) => {
    try {
        const column = await Column.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
        if (!column) {
            return res.status(404).json({ message: 'Column not found' })
        }
        const result = await queryData<IColumn>(Column, req)

        res.status(200).json({
            message: 'The Column is updated successfully',
            result,
        })
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const getColumns = async (req: Request, res: Response) => {
    try {
        const result = await queryData<IColumn>(Column, req)
        res.status(200).json(result)
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const deleteColumn = async (req: Request, res: Response) => {
    try {
        const column = await Column.findByIdAndDelete(req.params.id)
        if (!column) {
            return res.status(404).json({ message: 'Column not found' })
        }
        const result = await queryData<IColumn>(Column, req)
        res.status(200).json({
            message: 'Column deleted successfully',
            result,
        })
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const searchColumns = (req: Request, res: Response) => {
    return search(Column, req, res)
}
