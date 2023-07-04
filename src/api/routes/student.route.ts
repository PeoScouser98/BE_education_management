import express from 'express';
import {
	createStudent,
	updateStudent,
	getStudentByClass,
	getStudentDetail,
	serviceStudent,
	getStudentLeftSchool,
	attendanceStudentByClass,
	selectAttendanceByClass,
	getAttendanceByStudent,
	selectAttendanceAllClass,
	getPolicyBeneficiary,
	getStudentsByParents,
	promoteStudentsByClass
} from '../controllers/student.controller';
import { checkAuthenticated, checkIsHeadmaster, checkIsTeacher } from '../middlewares/authGuard.middleware';

const router = express.Router();

router.get('/students/attendance', checkAuthenticated, checkIsTeacher, selectAttendanceAllClass);
router.get('/students/children-of-parents', checkAuthenticated, getStudentsByParents);
router.get('/students/attendance/:classId', checkAuthenticated, checkIsTeacher, selectAttendanceByClass);
router.get('/students/attendance/student/:id', checkAuthenticated, getAttendanceByStudent);
router.get('/students/policy-beneficiary', checkAuthenticated, checkIsHeadmaster, getPolicyBeneficiary);
router.get('/students/left-school', checkAuthenticated, checkIsTeacher, getStudentLeftSchool);
router.get('/students/detail/:id', checkAuthenticated, getStudentDetail);
router.get('/students/:classId', checkAuthenticated, checkIsTeacher, getStudentByClass);
router.patch('/students/graduation-promote/:classId', checkAuthenticated, checkIsHeadmaster, promoteStudentsByClass);
router.post('/students', checkAuthenticated, checkIsHeadmaster, createStudent);
router.patch('/students/attendance/:classId', checkAuthenticated, attendanceStudentByClass);
router.patch('/students/services/:id', checkAuthenticated, serviceStudent);
router.patch('/students/:id', checkAuthenticated, checkIsHeadmaster, updateStudent);

export default router;
