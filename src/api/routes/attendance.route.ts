import express from 'express';
import * as AttendanceController from '../controllers/attendance.controller';

const router = express.Router();

router.put('/attendances/:classId', AttendanceController.saveAttendanceByClass);
router.get('/attendances/today/:classId', AttendanceController.getTodayClassAttendanceBySession);
router.get('/attendances/by-class/:classId', AttendanceController.getAttendanceByClass);
router.get('/attendances/student/:studentId', AttendanceController.getStudentAttendance);

export default router;
