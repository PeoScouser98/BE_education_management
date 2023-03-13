import express from 'express';
import * as TeacherController from '../controllers/teacher.controller';

const router = express.Router();

router.post('/marking-attendance', TeacherController.markingAttendance);
// router.post('/auth/signin-as-teacher', TeacherController.signinAsTeacher);

export default router;
