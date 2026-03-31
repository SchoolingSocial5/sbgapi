import express from 'express'
import multer from 'multer'
import {
  createMarketing,
  deleteMarketing,
  getMarketing,
  getMarketings,
  searchMarketings,
  updateMarketing,
} from '../controllers/marketingController'
const upload = multer()

const router = express.Router()

router.route('/search').get(searchMarketings)
router.route('/:id').get(getMarketing).patch(upload.any(), updateMarketing).delete(upload.any(), deleteMarketing)
router.route('/').get(getMarketings).post(upload.any(), createMarketing)

export default router
