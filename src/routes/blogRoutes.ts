import express from 'express'
import multer from 'multer'
const upload = multer()

import {
  createBlog,
  deleteBlog,
  deleteBlogs,
  getABlog,
  getBlogs,
  searchBlogs,
  updateBlog,
} from '../controllers/blogController'

const router = express.Router()

router.route('/search').get(searchBlogs)
router.route('/:id').get(getABlog).patch(upload.any(), updateBlog).delete(upload.any(), deleteBlog)
router.route('/').get(getBlogs).post(upload.any(), createBlog)
router.route('/mass-delete').patch(upload.any(), deleteBlogs)

export default router
