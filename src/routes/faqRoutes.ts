import express from 'express'
import multer from 'multer'
import {
  createFaq,
  getFaq,
  getFaqs,
  searchFaqs,
  updateFaq,
} from '../controllers/faqController'
const upload = multer()

const router = express.Router()

router.route('/search').get(searchFaqs)
router.route('/:id').get(getFaq).patch(upload.any(), updateFaq)
router.route('/').get(getFaqs).post(upload.any(), createFaq)

export default router
