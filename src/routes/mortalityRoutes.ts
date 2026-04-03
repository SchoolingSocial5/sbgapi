import express from 'express'
import multer from 'multer'
import {
  createMortality,
  getMortality,
  getMortalities,
  searchMortalities,
  updateMortality,
} from '../controllers/mortalityController'
const upload = multer()

const router = express.Router()

router.route('/search').get(searchMortalities)
router.route('/:id').get(getMortality).patch(upload.any(), updateMortality)
router.route('/').get(getMortalities).post(upload.any(), createMortality)

export default router
