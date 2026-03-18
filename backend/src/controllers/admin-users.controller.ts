import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../modules/users/user.repository';

const userRepository = new UserRepository();

export class AdminUsersController {
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const skip = (page - 1) * limit;
      const role = req.query.role as string | undefined;
      const search = req.query.search as string | undefined;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';

      const where: any = {};

      if (role) {
        where.role = role;
      }

      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { businessName: { contains: search, mode: 'insensitive' } },
        ];
      }

      const allowedSortFields = ['createdAt', 'email', 'firstName', 'lastName', 'role'];
      const orderBy: any = allowedSortFields.includes(sortBy)
        ? { [sortBy]: sortOrder }
        : { createdAt: 'desc' };

      const [users, total] = await Promise.all([
        userRepository.findManyWithOrder(where, skip, limit, orderBy),
        userRepository.count(where),
      ]);

      return res.json({
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: 'isActive must be a boolean' });
      }

      const user = await userRepository.update(userId, { isActive });

      return res.json({ data: user });
    } catch (error) {
      return next(error);
    }
  }
}

export default new AdminUsersController();
