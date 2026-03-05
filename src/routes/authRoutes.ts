import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validate } from '../middleware/validationMiddleware.js';
import { registerSchema, loginSchema, requestPasswordResetSchema, resetPasswordSchema } from '../validators/authValidator.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// Password Reset Flow
router.post('/request-password-reset', validate(requestPasswordResetSchema), authController.requestPasswordReset);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Get current user info
router.get('/me', authMiddleware, authController.me);

export default router;
