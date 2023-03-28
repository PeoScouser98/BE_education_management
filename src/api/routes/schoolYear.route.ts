import express from 'express';
import * as SchoolYearController from '../controllers/schoolYear.controller';

const router = express.Router();

router.get('/school-year/', SchoolYearController.list);
router.post('/school-year/', SchoolYearController.create);
router.put('/school-year/:id', SchoolYearController.update);
router.delete('/school-year/:id', SchoolYearController.remove);

export default router;
