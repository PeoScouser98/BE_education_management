import express, { Router } from 'express';
import teacherRouter from './teacher.route';
import studentRouter from './student.route';
import schoolYearRouter from './schoolYear.route';
import authRouter from './auth.router';
const router = express.Router();

const rootRouters: Array<Router> = [teacherRouter, studentRouter, schoolYearRouter, authRouter];

rootRouters.forEach((route) => {
	router.use(route);
});

export default router;
