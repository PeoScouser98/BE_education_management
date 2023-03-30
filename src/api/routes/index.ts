import express, { Router } from 'express';
import userRouter from './user.route';
import studentRouter from './student.route';
import schoolYearRouter from './schoolYear.route';
import authRouter from './auth.router';
import classRouter from './class.route';
import trancriptRouter from './subjectTrancription.route';

import subjectRouter from './subject.route';

import permissionRouter from './permission.route';

const rootRouters: Array<Router> = [
	classRouter,
	userRouter,
	authRouter,
	studentRouter,
	subjectRouter,
	schoolYearRouter,
	permissionRouter,
	trancriptRouter,
];
const router = express.Router();

rootRouters.forEach((route) => {
	router.use(route);
});

export default router;
