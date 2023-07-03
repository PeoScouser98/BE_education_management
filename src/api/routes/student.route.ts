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
	getPolicyBeneficiary,
	getStudentsByParents,
	promoteStudentsByClass
} from '../controllers/student.controller';
import { checkAuthenticated, checkIsHeadmaster } from '../middlewares/authGuard.middleware';

const router = express.Router();

router.get('/students/attendance', checkAuthenticated, selectAttendanceAllClass);
router.get('/students/children-of-parents', checkAuthenticated, getStudentsByParents);
router.get('/students/attendance/:classId', checkAuthenticated, selectAttendanceByClass);
router.get('/students/attendance/student/:id', checkAuthenticated, selectAttendanceByStudent);
router.get('/students/policy-beneficiary', checkAuthenticated, getPolicyBeneficiary);
router.get('/students/stop/:type', checkAuthenticated, getStudentStop);
router.get('/students/detail/:id', checkAuthenticated, getStudentDetail);
router.get('/students/:classId', getStudentByClass);
router.post('/students', checkAuthenticated, createStudent);
router.patch('/students/set-student-graduated', checkAuthenticated, checkIsHeadmaster, promoteStudentsByClass);
router.patch('/students/attendance/:classId', checkAuthenticated, attendanceStudentByClass);
router.patch('/students/services/:id', checkAuthenticated, serviceStudent);
router.patch('/students/:id', checkAuthenticated, updateStudent);

export default router;
