import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendValidationError } from '@/shared/utils/responses';

type ValidationTarget = 'body' | 'query' | 'params' | 'headers';

export const validate = (
  schema: ZodSchema,
  target: ValidationTarget = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[target];
      const validatedData = schema.parse(dataToValidate);
      
      (req as any)[target] = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        
        sendValidationError(res, validationErrors);
        return;
      }
      
      next(error);
    }
  };
};

export const validateBody = (schema: ZodSchema) => validate(schema, 'body');
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');