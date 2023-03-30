import * as learningMaterialController from '../controllers/learningMaterial.controller';
import express from 'express';
import multer from 'multer';

const upload = multer();
const router = express.Router();

router.post('/learning-material/upload', upload.any(), learningMaterialController.postFile);

export default router;
