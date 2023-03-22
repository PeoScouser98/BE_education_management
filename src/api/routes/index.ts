import express, { Router } from 'express';
import userRouter from './user.route';
import studentRouter from './student.route';
import schoolYearRouter from './schoolYear.route';
import authRouter from './auth.router';
import classRouter from './class.route';
import subjectRouter from './subject.route';

const rootRouters: Array<Router> = [
	userRouter,
	studentRouter,
	classRouter,
	subjectRouter,
	schoolYearRouter,
	authRouter,
];
const router = express.Router();

rootRouters.forEach((route) => {
	router.use(route);
});

export default router;
