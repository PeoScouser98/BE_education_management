import express from 'express';
import {
	createStudent,
	updateStudent,
	getStudentByClass,
	getStudentDetail,
	serviceStudent,
	getStudentStop,
	attendanceStudentByClass,
	selectAttendanceByClass,
	selectAttendanceByStudent,
	selectAttendanceAllClass,
	getPolicyBeneficiary
} from '../controllers/student.controller';

const router = express.Router();

// *** Chú ý ***: có 2 path student: students và student (có s và không s)
router.get('/students/attendance', selectAttendanceAllClass);
router.get('/students/attendance/:classId', selectAttendanceByClass);
router.get('/students/attendance/student/:id', selectAttendanceByStudent);
router.get('/students/policyBeneficiary', getPolicyBeneficiary);
router.get('/students/stop/:type', getStudentStop);
router.get('/students/detail/:id', getStudentDetail);
router.get('/students/:class', getStudentByClass);
router.post('/students', createStudent);
router.patch('/students/attendance/:classId', attendanceStudentByClass);
router.patch('/students/services/:id', serviceStudent);
router.patch('/students/:id', updateStudent);

export default router;
