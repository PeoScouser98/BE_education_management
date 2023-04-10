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

router.put('/subjects/restore/:id', checkAuthenticated, checkIsHeadmaster, restore);
router.post('/subjects', checkAuthenticated, checkIsHeadmaster, create);
router.put('/subjects/:id', checkAuthenticated, checkIsHeadmaster, update);
router.delete('/subjects/:id', checkAuthenticated, checkIsHeadmaster, deleted);
router.get('/subjects/trash', checkAuthenticated, checkIsHeadmaster, getTrash);
router.get('/subjects', checkIsHeadmaster, list);

export default router;
