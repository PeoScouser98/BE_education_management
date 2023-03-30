import express from 'express';
import * as TrancriptionController from '../controllers/subjectTrancription.controllers';

const router = express.Router();

router.post('/transcripts/:classId/:subjectId', TrancriptionController.scoreTableInputs);

export default router;
