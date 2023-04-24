import * as learningMaterialController from '../controllers/learningMaterial.controller';
import express from 'express';
import multer from 'multer';
import { checkAuthenticated, checkIsTeacher } from '../middlewares/authGuard.middleware';
const upload = multer();
const router = express.Router();

router.post(
	'/learning-materials/upload',
	checkAuthenticated,
	checkIsTeacher,
	upload.any(),
	learningMaterialController.uploadFile
);
router.get(
	'/learning-materials',
	checkAuthenticated,
	checkIsTeacher,
	learningMaterialController.getFiles
);
router.patch(
	'/learning-materials/:fileId/edit',
	checkAuthenticated,
	checkIsTeacher,
	learningMaterialController.updateFile
);
router.delete(
	'/learning-materials/:fileId/delete',
	checkAuthenticated,
	checkIsTeacher,
	learningMaterialController.deleteFile
);

export default router;
