import express from 'express'
import multer from 'multer'
import {
  createService,
  getService,
  getServices,
  searchServices,
  updateService,
} from '../controllers/serviceController'
const upload = multer()

const router = express.Router()

router.route('/search').get(searchServices)
router.route('/:id').get(getService).patch(upload.any(), updateService)
router.route('/').get(getServices).post(upload.any(), createService)

export default router
