import express from 'express'
import multer from 'multer'
const upload = multer()

import {
  getEmailById,
  getEmails,
  updateEmail,
  createEmail,
  sendEmailToUsers,
  deleteEmails,
} from '../controllers/message/emailController'
import {
  createNotificationTemplate,
  getNotificationTemplateById,
  getNotificationTemplates,
  updateNotificationTemplate,
} from '../controllers/message/notificationTemplateController'

const router = express.Router()

router.route('/mass-delete').patch(upload.any(), deleteEmails)
router.route('/').get(getEmails).post(upload.any(), createEmail)
router.route('/send/:id').patch(upload.any(), sendEmailToUsers)

router
  .route('/templates')
  .get(getNotificationTemplates)
  .post(upload.any(), createNotificationTemplate)

router
  .route('/templates/:id')
  .get(getNotificationTemplateById)
  .patch(upload.any(), updateNotificationTemplate)

router
  .route('/:id')
  .get(getEmailById)
  .patch(upload.any(), updateEmail)

export default router
