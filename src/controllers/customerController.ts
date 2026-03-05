import { Response } from 'express';
import { AuthRequest } from '../types/globalTypes.js';
import { customerModel } from '../models/customerModel.js';
import { getPaginationQuery } from '../utils/helpers.js';

export const customerController = {
  async list(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    
    // Fallback: If no pagination passed, provide default max limit dynamically.
    const pagination = getPaginationQuery(req.query);

    try {
      const customers = await customerModel.findAllByUser(req.userId, pagination);
      return res.json(customers);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to fetch customers' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    const { name, mobile } = req.body;
    try {
      const result = await customerModel.create(req.userId, { name, mobile });
      return res.json({ id: result.insertId, name, mobile });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create customer' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    const { name, mobile } = req.body;
    try {
      await customerModel.update(Number(id), req.userId, { name, mobile });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update customer' });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    const { id } = req.params;
    try {
      // Perform soft delete
      await customerModel.softDelete(Number(id), req.userId);
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to delete customer' });
    }
  }
};
