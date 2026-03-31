import express from 'express'
import { getConsumptionSummary, getExpensesSummary, getPurchasesSummary, getSalarySummary, getSalesSummary } from '../controllers/summaryController'

const router = express.Router()
router.route('/expenses').get(getExpensesSummary)
router.route('/sales').get(getSalesSummary)
router.route('/purchases').get(getPurchasesSummary)
router.route('/salaries').get(getSalarySummary)
router.route('/consumptions').get(getConsumptionSummary)

export default router
