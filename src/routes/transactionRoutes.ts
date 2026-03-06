import { Router } from 'express';
import { transactionController } from '../controllers/transactionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { createTransactionSchema, updateTransactionSchema } from '../validators/transactionValidator.js';

const router = Router();

// Apply auth middleware to all transaction routes
router.use(authMiddleware);

// Core transaction logic
router.post('/', validate(createTransactionSchema), transactionController.create);
router.put('/:id', validate(updateTransactionSchema), transactionController.update);
router.delete('/:id', transactionController.delete);

// We move dynamic /:customerId to the bottom to prevent shadowing /summary and /entries

// Summary & Dashboard (Moving here to follow component separation better, or to a dedicated sum/d-board route)
// These logically relate to transaction aggregates
router.get('/summary', transactionController.getSummary);
router.get('/dashboard', transactionController.getDashboard);

// Restore & Entries Backup logic
router.get('/entries', transactionController.getEntries);
router.post('/restore', transactionController.restore);

// Specialized endpoints (Dynamic parameters must be at the very bottom to avoid route shadowing)
router.get('/:customerId', transactionController.listByCustomer);

export default router;
