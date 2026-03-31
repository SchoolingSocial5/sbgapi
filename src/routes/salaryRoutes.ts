import express from 'express'
import multer from 'multer'

import { createSalary, getLatestSalaries, getSalaries, getSalary, updateSalary } from '../controllers/salaryController'
const upload = multer()

const router = express.Router()
router.route('/latest').get(getLatestSalaries)
router.route('/:id').get(getSalary).patch(upload.any(), updateSalary)
router.route('/').get(getSalaries).post(upload.any(), createSalary)

export default router
