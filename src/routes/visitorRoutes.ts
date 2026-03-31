import express from 'express'
import multer from 'multer'

import {
  createVisitor,
  getVisitor,
  getVisitors,
  searchVisitors,
  updateVisitor,
} from '../controllers/visitorController'
import { getActivities } from '../controllers/activityController'
const upload = multer()

const router = express.Router()

router.route('/activities').get(getActivities)
router.route('/search').get(searchVisitors)
router.route('/:id').get(getVisitor).patch(upload.any(), updateVisitor)
router.route('/').get(getVisitors).post(upload.any(), createVisitor)

export default router
