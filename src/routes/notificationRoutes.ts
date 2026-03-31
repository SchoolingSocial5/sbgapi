import express from 'express'
import multer from 'multer'
const upload = multer()

import {
  createNotificationTemplate,
  deleteNotificationTemplate,
  getNotificationTemplateById,
  getNotificationTemplates,
  updateNotificationTemplate,
} from '../controllers/message/notificationTemplateController'
import {
  getNotifications,
  readNotifications,
} from '../controllers/message/notificationController'

const router = express.Router()

router
  .route('/templates')
  .get(getNotificationTemplates)
  .post(upload.any(), createNotificationTemplate)

router
  .route('/templates/:id')
  .get(getNotificationTemplateById)
  .patch(upload.any(), updateNotificationTemplate)
  .delete(deleteNotificationTemplate)

router.route('/').get(getNotifications).patch(readNotifications)
router.route('/:id').patch(upload.any(), updateNotificationTemplate)

export default router
