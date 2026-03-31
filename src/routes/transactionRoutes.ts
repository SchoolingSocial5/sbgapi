import express from 'express'
import multer from 'multer'
import {
  createTrasanction,
  getTransactions,
  GetTransactionSummary,
  massDeleteTrasanction,
  purchaseProducts,
  updatePartPayment,
  updateTransaction,
} from '../controllers/transactionController'
const upload = multer()

const router = express.Router()

router.route('/mass-delete').patch(upload.any(), massDeleteTrasanction)
router.route('/').get(getTransactions).post(upload.any(), createTrasanction)
router.route('/purchase').post(purchaseProducts)
router.route('/barchart').get(GetTransactionSummary)
router.route('/part-payment/:id').patch(upload.any(), updatePartPayment)
router.route('/:id').patch(upload.any(), updateTransaction)

export default router
