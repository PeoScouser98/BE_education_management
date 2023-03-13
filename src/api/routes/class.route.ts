import express from 'express';
import * as classController from '../controllers/class.controller';
import { checkIsHeadmaster } from '../middlewares/authGuard.middleware';
const router = express.Router();

router.post('/classes', checkIsHeadmaster, classController.createClass);

export default router;
