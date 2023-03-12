import express from 'express';
import { checkAuthenticated, checkIsHeadmaster } from '../middlewares/authGuard.middleware';
import * as HeadmasterControler from '../controllers/headmaster.controller';
const router = express.Router();

router.post('/create-teacher-account', checkAuthenticated, checkIsHeadmaster, HeadmasterControler.createTeacherAccount);
// router.post('/auth/signin-as-headmaster', HeadmasterControler.signinAsHeadmaster);
export default router;
