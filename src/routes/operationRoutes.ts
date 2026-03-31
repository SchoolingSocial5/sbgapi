import express from 'express'
import multer from 'multer'
import { createOperation, getOperation, getOperations, searchOperations, updateOperation } from '../controllers/operationController'

const upload = multer()

const router = express.Router()

router.route('/search').get(searchOperations)
router.route('/:id').get(getOperation).patch(upload.any(), updateOperation)
router.route('/').get(getOperations).post(upload.any(), createOperation)

export default router
