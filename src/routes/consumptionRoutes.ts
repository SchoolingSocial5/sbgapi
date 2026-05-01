import express from 'express'
import multer from 'multer'
import {
  createConsumption,
  getConsumption,
  getConsumptions,
  searchConsumptions,
  updateConsumption,
  deleteConsumption,
} from '../controllers/consumptionController'
const upload = multer()

const router = express.Router()

router.route('/search').get(searchConsumptions)
router.route('/:id').get(getConsumption).patch(upload.any(), updateConsumption).delete(deleteConsumption)
router.route('/').get(getConsumptions).post(upload.any(), createConsumption)

export default router
