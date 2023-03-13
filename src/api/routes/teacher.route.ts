import express from 'express';
import * as TeacherController from '../controllers/teacher.controller';

const router = express.Router();

router.post('/marking-attendance', TeacherController.markingAttendance);

export default router;
