import "dotenv/config";
import http from "http";
import app, { allowedOrigins } from "./app.js";
import connectDB from "./config/db.js";
import setupSocket from "./Socket/socket.server.js";
import config from "./config/config.js";

const PORT = config.port || 5000;

let server;
let io;

const start = async () => {
  try {
    config.validateConfig();
    await connectDB();

    server = http.createServer(app);
    io = setupSocket(server, allowedOrigins);

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.IO Signaling Server Ready`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      if (process.env.NODE_ENV === 'production') {
        console.log(`✅ Production mode enabled`);
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(() => {
        console.log('HTTP server closed');
        
        if (io) {
          io.close(() => {
            console.log('Socket.IO server closed');
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Promise Rejection:', err);
      if (process.env.NODE_ENV === 'production') {
        // In production, you might want to log to a service like Sentry
      }
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      gracefulShutdown('uncaughtException');
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();
