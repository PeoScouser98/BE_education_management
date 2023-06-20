import express from 'express';
import * as TrancriptionController from '../controllers/subjectTrancription.controllers';
import { checkAuthenticated, checkIsTeacher } from '../middlewares/authGuard.middleware';

const router = express.Router();

router.post(
	'/transcripts/:classId/:subjectId',
	checkAuthenticated,
	checkIsTeacher,
	TrancriptionController.scoreTableInputs
);
router.post(
	'/transcripts/:studentId/:subjectId',
	checkAuthenticated,
	checkIsTeacher,
	TrancriptionController.scoreTableInputOne
);
// router.get('/transcripts/class/:classId/:subjectId', TrancriptionController.getTranscriptByClass);
router.get('/transcripts/student/:id', checkAuthenticated, TrancriptionController.getTranscriptByStudent);
router.get(
	'/transcript/subjectAll/:classId',
	checkAuthenticated,
	TrancriptionController.selectTranscriptAllSubjectByClass
);

export default router;
