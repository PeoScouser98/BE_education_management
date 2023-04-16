import express from 'express';
import * as permissionController from '../controllers/permission.controllers';
import { checkIsHeadmaster, checkAuthenticated } from '../middlewares/authGuard.middleware';
const router = express.Router();

router.get('/permissions/get-by-roll', permissionController.read);

router.post('/permissions', checkAuthenticated, checkIsHeadmaster, permissionController.create);

router.put('/permissions/:id', checkAuthenticated, checkIsHeadmaster, permissionController.update);

router.put(
	'/permissions/:id/restore',
	checkAuthenticated,
	checkIsHeadmaster,
	permissionController.restore
);

router.delete(
	'/permissions/:id',
	checkAuthenticated,
	checkIsHeadmaster,
	permissionController.remove
);

export default router;
