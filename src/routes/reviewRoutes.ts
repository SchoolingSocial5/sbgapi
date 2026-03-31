import express from 'express'
import multer from 'multer'
import {
  createRating,
  deleteReviews,
  getRating,
  getRatings,
  searchRatings,
  updateRating,
} from '../controllers/reviewController'
const upload = multer()

const router = express.Router()

router.route('/search').get(searchRatings)
router.route('/mass-delete').patch(deleteReviews)
router.route('/:username').get(getRating).patch(upload.any(), updateRating)
router.route('/').get(getRatings).post(upload.any(), createRating)

export default router
