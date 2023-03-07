import express from 'express';
import { checkIsHeadmaster } from '../middlewares/checkAuth.middleware';
import * as HeadmasterControler from '../controllers/headmaster.controller';
const router = express.Router();

router.post('/auth/create-teacher-account', checkIsHeadmaster, HeadmasterControler.createTeacherAccount);
router.post('/auth/signin-as-headmaster', HeadmasterControler.signinAsHeadmaster);
export default router;
