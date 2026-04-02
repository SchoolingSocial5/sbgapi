import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { handleError } from '../utils/errorHandler'
import { IPen, Pen } from '../models/penModel'

export const createPen = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        await Pen.create(req.body)
        const result = await queryData<IPen>(Pen, req)
        res.status(200).json({
            message: 'Pen was created successfully',
            result,
        })
    } catch (error: any) {
        handleError(res, undefined, undefined, error)
    }
}

export const getPen = async (
    req: Request,
    res: Response
): Promise<Response | void> => {
    try {
        const pen = await Pen.findById(req.params.id)
        if (!pen) {
            return res.status(404).json({ message: 'Pen not found' })
        }

        res.status(200).json({ data: pen })
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const updatePen = async (req: Request, res: Response) => {
    try {
        const pen = await Pen.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
        if (!pen) {
            return res.status(404).json({ message: 'Pen not found' })
        }
        const result = await queryData<IPen>(Pen, req)

        res.status(200).json({
            message: 'The Pen is updated successfully',
            result,
        })
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const getPens = async (req: Request, res: Response) => {
    try {
        const result = await queryData<IPen>(Pen, req)
        res.status(200).json(result)
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const deletePen = async (req: Request, res: Response) => {
    try {
        const pen = await Pen.findByIdAndDelete(req.params.id)
        if (!pen) {
            return res.status(404).json({ message: 'Pen not found' })
        }
        const result = await queryData<IPen>(Pen, req)
        res.status(200).json({
            message: 'Pen deleted successfully',
            result,
        })
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const searchPens = (req: Request, res: Response) => {
    return search(Pen, req, res)
}
