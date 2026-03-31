import express from 'express'
import multer from 'multer'
import {
  createSocial,
  deleteSocial,
  getSocial,
  getSocials,
  searchSocials,
  updateSocial,
} from '../controllers/socialController'
const upload = multer()

const router = express.Router()

router.route('/search').get(searchSocials)
router.route('/:id').get(getSocial).patch(upload.any(), updateSocial).delete(upload.any(), deleteSocial)
router.route('/').get(getSocials).post(upload.any(), createSocial)

export default router
