import express from 'express';
import * as TrancriptionController from '../controllers/subjectTrancription.controllers';

const router = express.Router();

router.post('/transcripts/:classId/:subjectId', TrancriptionController.scoreTableInputs);
router.post('/transcripts/:studentId/:subjectId', TrancriptionController.scoreTableInputOne);
router.get('/transcripts/class/:classId/:subjectId', TrancriptionController.getTranscriptByClass);
router.get('/transcripts/student/:id', TrancriptionController.getTranscriptByStudent);
router.get('/transcript/subjectAll/:classId', TrancriptionController.selectTranscriptAllSubjectByClass);

export default router;
