import express, { Router } from 'express';
import teacherRouter from './teacher.route';
import studentRouter from './student.route';
import schoolYearRouter from './schoolYear.route';
import authRouter from './auth.router';
import classRouter from './class.route';
import userRouter from './user.route';
const rootRouters: Array<Router> = [
	teacherRouter,
	studentRouter,
	schoolYearRouter,
	authRouter,
	userRouter,
];
const router = express.Router();

rootRouters.forEach((route) => {
	router.use(route);
});

export default router;
