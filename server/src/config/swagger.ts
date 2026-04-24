import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';
import { env } from './env';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BookG Priest Booking API',
      version: '1.0.0',
      description: 'API documentation for the Priest Booking System',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
        },
      },
      responses: {
        Unauthorized: {
          description: 'Not authenticated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Not authenticated' },
                },
              },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  message: { type: 'string', example: 'Resource not found' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '..', 'routes', '*.{ts,js}'),
    path.join(__dirname, '..', 'models', '*.{ts,js}'),
  ],
};

export const setupSwagger = (app: Express): void => {
  const spec = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
  app.get('/api-docs.json', (_, res) => res.json(spec));
};
