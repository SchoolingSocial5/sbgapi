import express from 'express'
import multer from 'multer'
const upload = multer()

import {
    createApplication, deleteApplication,
    deleteApplications, getApplication, getApplications,
    searchApplications, updateApplication
}
    from '../controllers/applicationController'

const router = express.Router()

router.route('/search').get(searchApplications)
router.route('/:id').get(getApplication).patch(upload.any(), updateApplication).delete(deleteApplication)
router.route('/').get(getApplications).post(upload.any(), createApplication)
router.route('/mass-delete').patch(upload.any(), deleteApplications)

export default router