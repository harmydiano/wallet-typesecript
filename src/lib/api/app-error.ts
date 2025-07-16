import { ValidationError } from 'joi';

export interface ValidationErrorItem {
  [key: string]: string;
}

export default class AppError extends Error {
  public statusCode: number;
  public errors?: ValidationErrorItem[];

  constructor(message: string, statusCode: number = 500, errors?: ValidationErrorItem[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'AppError';
  }

  /**
   * Format Joi validation errors
   */
  static formatInputError(validation: { error?: ValidationError }): { passed: boolean; errors?: ValidationErrorItem[] } {
    if (!validation.error) {
      return { passed: true };
    }

    const errors: ValidationErrorItem[] = validation.error.details.map(detail => ({
      [detail.path.join('.')]: detail.message
    }));

    return { passed: false, errors };
  }
} 