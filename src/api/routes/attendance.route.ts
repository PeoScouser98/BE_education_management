import express from 'express'
import * as AttendanceController from '../controllers/attendance.controller'

const router = express.Router()

router.put('/attendances/:classId', AttendanceController.saveAttendanceByClass)
router.get('/attendances/by-class/:classId', AttendanceController.getClassAttendanceBySession)
router.get('/attendances/student/:studentId', AttendanceController.getStudentAttendance)

export default router
