import { Router } from 'express'
import {
    createColumn,
    getColumn,
    getColumns,
    updateColumn,
    deleteColumn,
    searchColumns,
} from '../controllers/columnController'

const router = Router()

router.route('/').get(getColumns).post(createColumn)
router.route('/search').get(searchColumns)
router.route('/:id').get(getColumn).patch(updateColumn).delete(deleteColumn)

export default router
