import express from 'express'
import multer from 'multer'

import {
  createExpense,
  getExpense,
  getExpenses,
  getLatestExpenses,
  updateExpense,
} from '../controllers/expenseController'
const upload = multer()

const router = express.Router()
router.route('/latest').get(getLatestExpenses)
router.route('/:id').get(getExpense).patch(upload.any(), updateExpense)
router.route('/').get(getExpenses).post(upload.any(), createExpense)

export default router
