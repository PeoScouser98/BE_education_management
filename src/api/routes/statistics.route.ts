import express from 'express'
import * as StatisticsController from '../controllers/statistics.controller'

const router = express.Router()

router.get('/statistics/student-by-grade', StatisticsController.getStdPercentageByGrade)

export default router
