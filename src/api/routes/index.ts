import express, { Router } from 'express';
import headmasterRouter from './user.route';
import teacherRouter from './teacher.route';
import studentRouter from './student.route';
import schoolYearRouter from './schoolYear.route';
import authRouter from './auth.router';
import classRouter from './class.route';
const router = express.Router();

const rootRouters: Array<Router> = [
	headmasterRouter,
	teacherRouter,
	studentRouter,
	schoolYearRouter,
	authRouter,
	classRouter,
];

rootRouters.forEach((route) => {
	router.use(route);
});

export default router;
