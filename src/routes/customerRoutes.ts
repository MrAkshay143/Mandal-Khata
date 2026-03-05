import { Router } from 'express';
import { customerController } from '../controllers/customerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customerValidator.js';

const router = Router();

// Apply auth middleware to all customer routes
router.use(authMiddleware);

router.get('/', customerController.list);
router.post('/', validate(createCustomerSchema), customerController.create);
router.put('/:id', validate(updateCustomerSchema), customerController.update);
router.delete('/:id', customerController.delete);

export default router;
