import express from 'express';
import * as TrancriptionController from '../controllers/subjectTrancription.controllers';
import { checkAuthenticated, checkIsTeacher } from '../middlewares/authGuard.middleware';

const router = express.Router();

router.put(
	'/transcripts/:classId/:subjectId',
	checkAuthenticated,
	checkIsTeacher,
	TrancriptionController.insertSubjectTranscriptByClass
);
router.get('/transcripts/class/:classId/:subjectId', checkAuthenticated, TrancriptionController.getTranscriptByClass);
router.get('/transcripts/student/:id', checkAuthenticated, TrancriptionController.getTranscriptByStudent);
router.get('/transcripts/:classId', checkAuthenticated, TrancriptionController.selectTranscriptAllSubjectByClass);

export default router;
