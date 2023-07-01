import express from 'express';
import { checkAuthenticated, checkIsHeadmaster } from '../middlewares/authGuard.middleware';
import * as TimeTableController from '../controllers/timeTable.controller';

const router = express.Router();

router.get('/time-table/:classId', TimeTableController.getTimeTableByClass);
router.post('/time-table/create', checkAuthenticated, checkIsHeadmaster, TimeTableController.createTimeTable);
router.patch('/time-table/:classId/update', checkAuthenticated, checkIsHeadmaster, TimeTableController.updateTimeTable);
router.delete(
	'/time-table/:classId/delete',
	checkAuthenticated,
	checkIsHeadmaster,
	TimeTableController.deleteTimeTable
);
router.get('/timetable/teacher/:teacherId', checkAuthenticated, TimeTableController.getTeacherTimetable);

export default router;
