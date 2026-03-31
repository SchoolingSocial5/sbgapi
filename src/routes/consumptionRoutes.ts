import express from 'express'
import multer from 'multer'
import {
  createConsumption,
  getConsumption,
  getConsumptions,
  searchConsumptions,
  updateConsumption,
} from '../controllers/consumptionController'
const upload = multer()

const router = express.Router()

router.route('/search').get(searchConsumptions)
router.route('/:id').get(getConsumption).patch(upload.any(), updateConsumption)
router.route('/').get(getConsumptions).post(upload.any(), createConsumption)

export default router
