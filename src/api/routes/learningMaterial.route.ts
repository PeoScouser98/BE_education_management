import * as learningMaterialController from '../controllers/learningMaterial.controller';
import express from 'express';
import multer from 'multer';
import { checkAuthenticated } from '../middlewares/authGuard.middleware';
const upload = multer();
const router = express.Router();

router.post(
	'/learning-material/upload',
	/**
	 * checkAuthenticated
	 * checkIsTeacherOrHeadmaster
	 * */
	upload.any(),
	learningMaterialController.uploadFile
);
router.get(
	'/learning-material',
	/**
	 * checkAuthenticated
	 * checkIsTeacherOrHeadmaster
	 * */
	learningMaterialController.getFiles
);
router.patch(
	'/learning-material/:fileId',
	/**
	 * checkAuthenticated
	 * checkIsTeacherOrHeadmaster
	 * */
	learningMaterialController.updateFile
);
router.delete(
	'/learning-material/:fileId',
	/**
	 * checkAuthenticated
	 * checkIsTeacherOrHeadmaster
	 * */
	learningMaterialController.deleteFile
);

export default router;
