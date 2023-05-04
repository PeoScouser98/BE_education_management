import express from 'express';
import {
	checkAuthenticated,
	checkIsHeadmaster,
	checkIsTeacher,
} from '../middlewares/authGuard.middleware';
import * as SubjectController from '../controllers/subject.controller';
const router = express.Router();

router.put(
	'/subjects/restore/:id',
	checkAuthenticated,
	checkIsHeadmaster,
	SubjectController.restore
);
router.post('/subjects', checkAuthenticated, checkIsHeadmaster, SubjectController.create);
router.get('/subjects/:id', checkAuthenticated, checkIsTeacher, SubjectController.read);
router.put('/subjects/:id', checkAuthenticated, checkIsHeadmaster, SubjectController.update);
router.delete('/subjects/:id', checkAuthenticated, checkIsHeadmaster, SubjectController.deleted);
router.get('/subjects/trash', checkAuthenticated, checkIsTeacher, SubjectController.getTrash);
router.get('/subjects', checkAuthenticated, checkIsTeacher, SubjectController.list);

export default router;
