import express from 'express'
import multer from 'multer'
import {
  createPolicy,
  createPosition,
  deletePolicy,
  deletePosition,
  getCompany,
  getPolcies,
  getPolicyById,
  getPositionById,
  getPositions,
  resetRecord,
  updateCompany,
  updatePolicy,
  updatePosition,
  deletePositions,
} from '../controllers/company/companyController'
const upload = multer()

const router = express.Router()

router.route('/').get(getCompany).patch(upload.any(), updateCompany)
router.route('/reset').patch(upload.any(), resetRecord)
router.route('/policy').get(getPolcies).post(upload.any(), createPolicy)
router.route('/positions').get(getPositions).post(upload.any(), createPosition)
router.route('/positions/mass-delete').patch(upload.any(), deletePositions)

router
  .route('/positions/:id')
  .get(getPositionById)
  .patch(upload.any(), updatePosition)
  .delete(deletePosition)
router
  .route('/policy/:id')
  .get(getPolicyById)
  .patch(upload.any(), updatePolicy)
  .delete(deletePolicy)

export default router
