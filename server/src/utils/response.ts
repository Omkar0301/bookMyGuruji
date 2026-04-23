import { Response } from 'express';

export const successResponse = <T>(
  res: Response,
  data: T,
  message = 'Success',
  status = 200
): Response => {
  return res.status(status).json({ success: true, message, data });
};

export const errorResponse = (
  res: Response,
  message: string,
  status = 500,
  errors?: object[]
): Response => {
  return res.status(status).json({ success: false, message, ...(errors && { errors }) });
};

export const paginatedResponse = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Success'
): Response => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
};
