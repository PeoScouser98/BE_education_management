import express from 'express';
import * as ClassController from '../controllers/class.controller';
import { checkAuthenticated, checkIsHeadmaster } from '../middlewares/authGuard.middleware';
const router = express.Router();

router.post('/classes', checkAuthenticated, checkIsHeadmaster, ClassController.createClass);
router.put(
	'/class/restore/:id',
	checkAuthenticated,
	checkIsHeadmaster,
	ClassController.restoreClass
);
router.put('/class/:id', checkAuthenticated, checkIsHeadmaster, ClassController.updateClass);
router.delete('/class/:id', checkAuthenticated, checkIsHeadmaster, ClassController.removeClass);
router.get('/classes/trash', checkIsHeadmaster, ClassController.getClassTrash);
router.get('/classes', checkAuthenticated, ClassController.getClasses);
router.get('/class/:id', checkAuthenticated, ClassController.getClassOne);

export default router;
