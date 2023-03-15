import express from 'express';
import { checkAuthenticated, checkIsHeadmaster } from '../middlewares/authGuard.middleware';
import * as userController from '../controllers/user.controller';
const router = express.Router();

router.post(
	'/create-teacher-account',
	checkAuthenticated,
	checkIsHeadmaster,
	userController.createTeacherAccount
);
router.post(
	'/create-parents-account',
	checkAuthenticated,
	checkIsHeadmaster,
	userController.createTeacherAccount
);
export default router;
