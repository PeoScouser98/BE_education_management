import express from 'express';
import passport from 'passport';
import '../../app/googlePassport';
import * as AuthController from '../controllers/auth.controller';

const router = express.Router();
router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

router.get(
	'/auth/google/callback',
	passport.authenticate('google', {
		failureRedirect: `${process.env.CLIENT_URL}/signin`,
	}),
	AuthController.signinWithGoogle
);

router.get('/auth/signout', AuthController.signout);
router.get('/auth/user', AuthController.getUser);
router.get('/auth/verify-account', AuthController.verifyAccount);

export default router;
