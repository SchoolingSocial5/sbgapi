import { Router } from 'express'
import {
    createPen,
    getPen,
    getPens,
    updatePen,
    deletePen,
    searchPens,
} from '../controllers/penController'

const router = Router()

router.route('/').get(getPens).post(createPen)
router.route('/search').get(searchPens)
router.route('/:id').get(getPen).patch(updatePen).delete(deletePen)

export default router
