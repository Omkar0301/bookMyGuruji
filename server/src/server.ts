import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { env, connectDB } from './config';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Create HTTP Server
  const server = http.createServer(app);

  // 3. Initialize Socket.io
  const io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  // Socket.io basic connection handling
  io.on('connection', (socket) => {
    logger.info(`🔌 Socket connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  // 4. Listen on PORT
  server.listen(env.PORT, () => {
    logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    logger.info(`📋 Health check: http://localhost:${env.PORT}/health`);
  });

  // ──────────────────────────────────────────────────────────────
  // Graceful shutdown
  // ──────────────────────────────────────────────────────────────

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    // Force exit after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after 10s timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled rejection', { error: err });
    shutdown('unhandledRejection');
  });
};

startServer();
