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

router.put('/subject/restore/:id', restore);
router.post('/subjects', create);
router.put('/subject/:id', update);
router.delete('/subject/:id', deleted);
router.get('/subjects/trash', getTrash);
router.get('/subjects', list);

export default router;
