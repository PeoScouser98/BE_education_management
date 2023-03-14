import express from 'express';
import * as classController from '../controllers/class.controller';
import { checkIsHeadmaster } from '../middlewares/authGuard.middleware';
const router = express.Router();

router.post('/classes', checkIsHeadmaster, classController.createClass);
router.put('/classes/:_id', checkIsHeadmaster, classController.updateClass);

export default router;
