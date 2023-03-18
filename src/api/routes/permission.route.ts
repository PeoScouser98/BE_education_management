import express from 'express';
import * as permissionController from '../controllers/permission.controllers';
import { checkIsHeadmaster } from '../middlewares/authGuard.middleware';
const router = express.Router();

router.get('/permission/', permissionController.list);
router.get('/permission/:id', permissionController.read);
router.post('/permission/', checkIsHeadmaster, permissionController.create);
router.put('/permission/:id', checkIsHeadmaster, permissionController.update);
router.delete('/permission/:id', checkIsHeadmaster, permissionController.remove);

export default router;