import express from 'express';
import * as schoolYearController from '../controllers/schoolYear.controller';

const router = express.Router();

router.get('/school-year/', schoolYearController.list);
router.post('/school-year/', schoolYearController.create);
router.put('/school-year/:schoolYearId', schoolYearController.update);
router.delete('/school-year/:schoolYearId', schoolYearController.remove);

export default router;
