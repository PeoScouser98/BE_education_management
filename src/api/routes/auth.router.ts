import express from 'express';
import * as AuthController from '../controllers/auth.controller';
import { checkAuthenticated } from '../middlewares/authGuard.middleware';

const router = express.Router();

router.post('/auth/google/login', AuthController.signinWithGoogle);
router.get('/auth/signout', checkAuthenticated, AuthController.signout);
router.get('/auth/user', checkAuthenticated, AuthController.getUser);
router.get('/auth/verify-account', AuthController.verifyAccount);
router.get('/auth/refresh-token', AuthController.refreshToken);
router.post('/auth/send-otp', AuthController.sendOtp);

export default router;
