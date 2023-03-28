import express from 'express';
import { checkAuthenticated, checkIsHeadmaster } from '../middlewares/authGuard.middleware';
import {
	list,
	create,
	update,
	deleted,
	restore,
	getTrash,
} from '../controllers/subject.controller';
const router = express.Router();

router.put('/subject/restore/:id', checkAuthenticated, checkIsHeadmaster, restore);
router.post('/subjects', checkAuthenticated, checkIsHeadmaster, create);
router.put('/subject/:id', checkAuthenticated, checkIsHeadmaster, update);
router.delete('/subject/:id', checkAuthenticated, checkIsHeadmaster, deleted);
router.get('/subjects/trash', checkAuthenticated, checkIsHeadmaster, getTrash);
router.get('/subjects', checkIsHeadmaster, list);

export default router;
