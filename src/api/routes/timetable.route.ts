import express from 'express'
import { checkAuthenticated, checkIsHeadmaster } from '../middlewares/authGuard.middleware'
import * as TimeTableController from '../controllers/timeTable.controller'

const router = express.Router()

router.get('/time-table/:classId', checkAuthenticated, TimeTableController.getTimeTableByClass)
router.put('/time-table/:classId', checkAuthenticated, checkIsHeadmaster, TimeTableController.saveTimeTable)
router.get('/timetable/teacher/:teacherId', checkAuthenticated, TimeTableController.getTeacherTimetable)

export default router
