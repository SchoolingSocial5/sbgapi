import express from 'express'
import multer from 'multer'
import { 
    createOperation, 
    getOperation, 
    getOperations, 
    searchOperations, 
    updateOperation,
    deleteOperation,
    getPerformanceSummary 
} from '../controllers/operationController'

const upload = multer()

const router = express.Router()

router.route('/search').get(searchOperations)
router.route('/performance-summary').get(getPerformanceSummary)
router.route('/:id').get(getOperation).patch(upload.any(), updateOperation).delete(deleteOperation)
router.route('/').get(getOperations).post(upload.any(), createOperation)

export default router
