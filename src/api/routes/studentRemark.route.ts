import express from 'express';
import * as StudentRemarkController from '../controllers/studentRemark.controller';
import { checkAuthenticated, checkIsTeacher } from '../middlewares/authGuard.middleware';

const router = express.Router();

router.put('/student-remark/:classId', checkAuthenticated, checkIsTeacher, StudentRemarkController.createStudentRemark);

export default router;
