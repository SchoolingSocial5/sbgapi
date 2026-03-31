import express from 'express'
import multer from 'multer'
import {
  createStrategy,
  getStrategy,
  getStrategies,
  searchStrategies,
  updateStrategy,
  deleteStrategy,
} from '../controllers/strategyController'
const upload = multer()

const router = express.Router()

router.route('/search').get(searchStrategies)
router.route('/:id').get(getStrategy).patch(upload.any(), updateStrategy).delete(upload.any(), deleteStrategy)
router.route('/').get(getStrategies).post(upload.any(), createStrategy)

export default router
