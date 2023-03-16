import express from 'express';
import * as classController from '../controllers/class.controller';
import { checkAuthenticated, checkIsHeadmaster } from '../middlewares/authGuard.middleware';
const router = express.Router();

router.post('/classes', checkAuthenticated, checkIsHeadmaster, classController.createClass);
router.put('/classes/:_id', checkAuthenticated, checkIsHeadmaster, classController.updateClass);
router.delete('/classes/:_id', checkAuthenticated, checkIsHeadmaster, classController.removeClass);
router.get('/classes/trash', checkIsHeadmaster, classController.getClassTrash);
router.get('/classes', checkAuthenticated, classController.getClasses);
router.get('/class/:_id', checkAuthenticated, classController.getClassOne);

export default router;
