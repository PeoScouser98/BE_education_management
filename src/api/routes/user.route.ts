import express from 'express';
import { checkAuthenticated, checkIsHeadmaster } from '../middlewares/authGuard.middleware';
import * as HeadmasterControler from '../controllers/user.controller';
const router = express.Router();

router.post(
	'/create-teacher-account',
	// checkAuthenticated,
	// checkIsHeadmaster,
	HeadmasterControler.createTeacherAccount
);
router.post('/create-parents-account');
export default router;
