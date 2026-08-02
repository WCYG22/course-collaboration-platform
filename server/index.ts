/**
 * CAML LMS Backend Server
 * Main Express server with all API routes
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database
import { initializeDatabase, closeDatabase } from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import coursesRoutes from './routes/courses.js';

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join course room
  socket.on('join-course', (courseId: string) => {
    socket.join(`course-${courseId}`);
    console.log(`Socket ${socket.id} joined course-${courseId}`);
  });

  // Leave course room
  socket.on('leave-course', (courseId: string) => {
    socket.leave(`course-${courseId}`);
    console.log(`Socket ${socket.id} left course-${courseId}`);
  });

  // New discussion post
  socket.on('new-post', (data: { courseId: string; post: any }) => {
    io.to(`course-${data.courseId}`).emit('post-created', data.post);
  });

  // New discussion reply
  socket.on('new-reply', (data: { courseId: string; postId: string; reply: any }) => {
    io.to(`course-${data.courseId}`).emit('reply-created', data);
  });

  // New notification
  socket.on('new-notification', (data: { userId: string; notification: any }) => {
    io.to(`user-${data.userId}`).emit('notification-received', data.notification);
  });

  // Typing indicator
  socket.on('typing', (data: { courseId: string; userName: string }) => {
    socket.to(`course-${data.courseId}`).emit('user-typing', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum 50MB allowed.' });
    }
    return res.status(400).json({ error: err.message });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize and start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized');

    // Start server
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🔌 WebSocket server ready`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(async () => {
    console.log('HTTP server closed');
    await closeDatabase();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  httpServer.close(async () => {
    console.log('HTTP server closed');
    await closeDatabase();
    process.exit(0);
  });
});

// Start the server
startServer();

export { io };
