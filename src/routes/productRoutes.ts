import express from 'express'
import multer from 'multer'
const upload = multer()

import {
  createProduct,
  deleteProduct,
  deleteProductStocking,
  getAProduct,
  getProducts,
  getProductStocks,
  postProductStock,
  searchProducts,
  updateProduct,
  updateProductStock,
} from '../controllers/productController'

const router = express.Router()

router.route('/search').get(searchProducts)

router
  .route('/stocking')
  .get(getProductStocks)
  .post(upload.any(), postProductStock)
router
  .route('/stocking/:id')
  .delete(deleteProductStocking)
  .patch(upload.any(), updateProductStock)

router
  .route('/:id')
  .get(getAProduct)
  .patch(upload.any(), updateProduct)
  .delete(deleteProduct)
router.route('/').get(getProducts).post(upload.any(), createProduct)

export default router
