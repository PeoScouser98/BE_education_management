import express from 'express';
import { checkAuthenticated, checkIsHeadmaster } from '../middlewares/authGuard.middleware';
import * as UserController from '../controllers/user.controller';
const router = express.Router();

router.post(
	'/create-teacher-account',
	checkAuthenticated,
	checkIsHeadmaster,
	UserController.createTeacherAccount
);
// router.post(
// 	'/create-parents-account',
// 	checkAuthenticated,
// 	checkIsHeadmaster,
// 	UserController.createTeacherAccount
// );

router.patch('/update-user', checkAuthenticated, UserController.updateUserInfo);
export default router;
