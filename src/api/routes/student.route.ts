import express from 'express';
import {
	createStudent,
	updateStudent,
	getStudentByClass,
	getStudentDetail,
	serviceStudent,
	getStudentStop,
} from '../controllers/student.controller';

const router = express.Router();

router.get('/students/stop/:type', getStudentStop);
router.get('/students/:class', getStudentByClass);
router.get('/student/:id', getStudentDetail);
router.post('/students', createStudent);

router.put('/student/services/:id', serviceStudent);
router.put('/student/:id', updateStudent);

export default router;
