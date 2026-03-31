import express from 'express'
import multer from 'multer'

import {
  createEquipment,
  getEquipment,
  getEquipments,
  searchEquipments,
  updateEquipment,
} from '../controllers/equipmentController'
const upload = multer()

const router = express.Router()

router.route('/search').get(searchEquipments)
router.route('/:id').get(getEquipment).patch(upload.any(), updateEquipment)
router.route('/').get(getEquipments).post(upload.any(), createEquipment)

export default router
