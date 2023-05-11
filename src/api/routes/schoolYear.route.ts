import express from 'express';
import * as SchoolYearController from '../controllers/schoolYear.controller';
import { checkAuthenticated, checkIsHeadmaster } from '../middlewares/authGuard.middleware';

const router = express.Router();

router.get('/schoolYears/current', checkAuthenticated, SchoolYearController.getCurrentYear);
router.get('/schoolYears', checkAuthenticated, SchoolYearController.schoolYearList);
router.post(
	'/schoolYears',
	checkAuthenticated,
	checkIsHeadmaster,
	SchoolYearController.createSchoolYear
);

export default router;
