import express from 'express';
import { checkIsHeadmaster } from '../middlewares/checkAuth.middleware';
import * as HeadmasterControler from '../controllers/headmaster.controller';
const router = express.Router();

router.post('/auth/create-teacher-account', checkIsHeadmaster, HeadmasterControler.createTeacherAccount);

export default router;
