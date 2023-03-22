import express from 'express';
import * as permissionController from '../controllers/permission.controllers';
import { checkIsHeadmaster, checkAuthenticated } from '../middlewares/authGuard.middleware';
const router = express.Router();

router.get('/permissions', checkAuthenticated, permissionController.list);
router.get('/permission', checkAuthenticated, permissionController.read);
router.post('/permission', checkAuthenticated, checkIsHeadmaster, permissionController.create);
router.put('/permission/:id', checkAuthenticated, checkIsHeadmaster, permissionController.update);
router.delete(
	'/permission/:id',
	checkAuthenticated,
	checkIsHeadmaster,
	permissionController.remove
);

export default router;
