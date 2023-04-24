import express from 'express';
import passport from 'passport';
import * as AuthController from '../controllers/auth.controller';
import appConfig from '../../configs/app.config';
import { checkAuthenticated } from '../middlewares/authGuard.middleware';

const router = express.Router();
router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
router.get(
	'/auth/google/callback',
	passport.authenticate('google', {
		failureRedirect: `${appConfig.CLIENT_URL}/signin`,
	}),
	AuthController.signinWithGoogle
);
router.get('/auth/signout', checkAuthenticated, AuthController.signout);
router.get('/auth/user', checkAuthenticated, AuthController.getUser);
router.get('/auth/verify-account', AuthController.verifyAccount);
router.get('/auth/refresh-token', AuthController.refreshToken);
router.post('/auth/send-otp', AuthController.sendOtp);

export default router;
