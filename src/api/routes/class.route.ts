import express from 'express';
import * as ClassController from '../controllers/class.controller';
import { checkAuthenticated, checkIsHeadmaster } from '../middlewares/authGuard.middleware';
const router = express.Router();

router.post('/classes', checkAuthenticated, checkIsHeadmaster, ClassController.createClass);
router.put('/classes/:_id', checkAuthenticated, checkIsHeadmaster, ClassController.updateClass);
router.delete('/classes/:_id', checkAuthenticated, checkIsHeadmaster, ClassController.removeClass);
router.get('/classes/trash', checkIsHeadmaster, ClassController.getClassTrash);
router.get('/classes', checkAuthenticated, ClassController.getClasses);
router.get('/class/:_id', checkAuthenticated, ClassController.getClassOne);

export default router;
