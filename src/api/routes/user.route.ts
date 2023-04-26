import express from 'express';
import {
	checkAuthenticated,
	checkIsHeadmaster,
	checkIsTeacher,
} from '../middlewares/authGuard.middleware';
import * as UserController from '../controllers/user.controller';
const router = express.Router();

router.post(
	'/create-teacher-account',
	checkAuthenticated,
	checkIsHeadmaster,
	UserController.createTeacherAccount
);
router.post(
	'/create-parents-account',
	checkAuthenticated,
	checkIsTeacher,
	UserController.createParentsAccount
);
router.patch('/update-user', checkAuthenticated, UserController.updateUserInfo);
router.patch(
	'/user/:userId/deactivate',
	checkAuthenticated,
	checkIsHeadmaster,
	UserController.deactivateTeacherAccount
);
router.get('/users/teachers', checkAuthenticated, UserController.getAllTeachers);
router.get('users/parents/:classId');

export default router;
