import * as learningMaterialController from '../controllers/learningMaterial.controller';
import express from 'express';
import multer from 'multer';
import { checkAuthenticated } from '../middlewares/authGuard.middleware';
const upload = multer();
const router = express.Router();

router.post(
	'/learning-materials/upload',
	/**
	 * checkAuthenticated
	 * checkIsTeacherOrHeadmaster
	 * */
	upload.any(),
	learningMaterialController.uploadFile
);
router.get(
	'/learning-materials',
	/**
	 * checkAuthenticated
	 * checkIsTeacherOrHeadmaster
	 * */
	learningMaterialController.getFiles
);
router.patch(
	'/learning-materials/:fileId/edit',
	/**
	 * checkAuthenticated
	 * checkIsTeacherOrHeadmaster
	 * */
	learningMaterialController.updateFile
);
router.delete(
	'/learning-materials/:fileId/delete',
	/**
	 * checkAuthenticated
	 * checkIsTeacherOrHeadmaster
	 * */
	learningMaterialController.deleteFile
);

export default router;
