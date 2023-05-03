import express from 'express';
import { checkAuthenticated } from '../middlewares/authGuard.middleware';
import * as TimeTableController from '../controllers/timeTable.controller';

const router = express.Router();

router.get('/time-table/:classId', TimeTableController.getTimeTableByClass);
router.post('/time-table/create', TimeTableController.createTimeTable);
router.patch('/time-table/:classId/update', TimeTableController.updateTimeTable);
router.delete('/time-table/:classId/delete', TimeTableController.deleteTimeTable);

export default router;
