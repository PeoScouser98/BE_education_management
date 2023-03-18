import express, { Request, Response } from 'express';
import passport from 'passport';
import '../../app/googlePassport';
import * as AuthController from '../controllers/auth.controller';

const router = express.Router();
router.get('/auth/google', passport.authenticate('google', { scope: ['email'] }));

router.get(
	'/auth/google/callback',
	passport.authenticate('google', {
		successRedirect: '/api/auth/signin/success',
		failureRedirect: `${process.env.CLIENT_URL}/signin`,
	})
);

router.get('/auth/signin/success', AuthController.signinWithGoogle);
router.post('/auth/signin', AuthController.signinWithPhoneOrEmail);
router.get('/auth/signout', AuthController.signout);
router.get('/auth/verify-account', AuthController.verifyAccount);

export default router;
