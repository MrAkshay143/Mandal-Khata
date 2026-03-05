import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { adminAuthMiddleware } from '../middleware/adminMiddleware.js';

const router = Router();

// Publicly accessible admin login
router.post('/login', adminController.login);

// Protected admin routes
router.use(adminAuthMiddleware);

router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/customers', adminController.getCustomers);
router.get('/stats', adminController.getStats);
router.put('/credentials', adminController.updateCredentials);

export default router;
