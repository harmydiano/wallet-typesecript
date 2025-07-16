import AppError from '../../../lib/api/app-error';

export default class AppValidation {
  /**
   * Validate create operation
   */
  async create(obj: any): Promise<{ passed: boolean; errors?: any[] }> {
    return AppError.formatInputError({ error: undefined });
  }

  /**
   * Validate update operation
   */
  async update(obj: any): Promise<{ passed: boolean; errors?: any[] }> {
    return AppError.formatInputError({ error: undefined });
  }
} 