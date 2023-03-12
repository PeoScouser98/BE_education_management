import express, { Router } from 'express';
import headmasterRouter from './headmaster.route';
import teacherRouter from './teacher.route';
import studentRouter from './student.route';
import schoolYearRouter from './schoolYear.route';
import authRouter from './auth.router';

const router = express.Router();

const rootRouters: Array<Router> = [headmasterRouter, teacherRouter, studentRouter, schoolYearRouter, authRouter];

rootRouters.forEach((route) => {
	router.use(route);
});

export default router;
