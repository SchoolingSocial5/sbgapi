import { Request, Response } from 'express'
import { queryData, search } from '../utils/query'
import { uploadFilesToS3 } from '../utils/fileUpload'
import { handleError } from '../utils/errorHandler'
import { io } from '../app'
import { ISalary, Salary, } from '../models/salaryModel'

export const createSalary = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const uploadedFiles = await uploadFilesToS3(req)
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url
        })

        const salaries = await Salary.create(req.body)
        const result = await queryData<ISalary>(Salary, req)
        io.emit("salaries", { salaries })
        res.status(200).json({
            message: 'Salarie was created successfully',
            result,
        })
    } catch (error: any) {
        handleError(res, undefined, undefined, error)
    }
}

export const getSalary = async (
    req: Request,
    res: Response
): Promise<Response | void> => {
    try {
        const salary = await Salary.findById(req.params.id)
        if (!salary) {
            return res.status(404).json({ message: 'Salary not found' })
        }

        res.status(200).json({ data: salary })
    } catch (error) {
        console.log(error)
        handleError(res, undefined, undefined, error)
    }
}

export const updateSalary = async (req: Request, res: Response) => {
    try {
        const uploadedFiles = await uploadFilesToS3(req)
        uploadedFiles.forEach((file) => {
            req.body[file.fieldName] = file.s3Url
        })

        const salary = await Salary.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
        if (!salary) {
            return res.status(404).json({ message: 'Salary not found' })
        }
        const result = await queryData<ISalary>(Salary, req)

        res.status(200).json({
            message: 'The Salary is updated successfully',
            result,
        })
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const getSalaries = async (req: Request, res: Response) => {
    try {
        const result = await queryData<ISalary>(Salary, req)
        res.status(200).json(result)
    } catch (error) {
        handleError(res, undefined, undefined, error)
    }
}

export const getLatestSalaries = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const salaries = await Salary.find()
            .sort({ createdAt: -1 }) // newest first
            .limit(5);

        res.status(200).json({
            success: true,
            count: salaries.length,
            results: salaries,
        });
    } catch (error) {
        console.error("Error fetching latest Salaries:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch latest Salaries",
        });
    }
};