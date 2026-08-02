/**
 * Authentication Middleware
 * JWT-based authentication with session management
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { db, dbType } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'caml-lms-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'student' | 'instructor';
    name: string;
  };
}

// Generate JWT token
export function generateToken(user: { id: string; email: string; role: string; name: string }): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Compare password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Verify JWT token middleware
export async function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: 'student' | 'instructor';
        name: string;
      };

      // Verify session exists in database
      const sessionExists = await verifySession(decoded.id, token);
      
      if (!sessionExists) {
        return res.status(401).json({ error: 'Session expired or invalid' });
      }

      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: 'Token expired' });
      }
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
}

// Verify session in database
async function verifySession(userId: string, token: string): Promise<boolean> {
  try {
    if (dbType === 'postgres') {
      const result = await (db as any).query(
        'SELECT id FROM sessions WHERE user_id = $1 AND token = $2 AND expires_at > NOW()',
        [userId, token]
      );
      return result.rows.length > 0;
    } else {
      const result = (db as any).prepare(
        'SELECT id FROM sessions WHERE user_id = ? AND token = ? AND expires_at > datetime("now")'
      ).get(userId, token);
      return !!result;
    }
  } catch (error) {
    console.error('Session verification error:', error);
    return false;
  }
}

// Create session in database
export async function createSession(userId: string, token: string): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  try {
    if (dbType === 'postgres') {
      await (db as any).query(
        'INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, $4)',
        [uuidv4(), userId, token, expiresAt]
      );
    } else {
      (db as any).prepare(
        'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
      ).run(uuidv4(), userId, token, expiresAt.toISOString());
    }
  } catch (error) {
    console.error('Session creation error:', error);
    throw error;
  }
}

// Delete session (logout)
export async function deleteSession(userId: string, token: string): Promise<void> {
  try {
    if (dbType === 'postgres') {
      await (db as any).query(
        'DELETE FROM sessions WHERE user_id = $1 AND token = $2',
        [userId, token]
      );
    } else {
      (db as any).prepare(
        'DELETE FROM sessions WHERE user_id = ? AND token = ?'
      ).run(userId, token);
    }
  } catch (error) {
    console.error('Session deletion error:', error);
    throw error;
  }
}

// Clean up expired sessions (run periodically)
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    if (dbType === 'postgres') {
      await (db as any).query('DELETE FROM sessions WHERE expires_at < NOW()');
    } else {
      (db as any).prepare('DELETE FROM sessions WHERE expires_at < datetime("now")').run();
    }
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
}

// Role-based access control middleware
export function requireRole(...roles: ('student' | 'instructor')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
}

// Rate limiting for login attempts (simple in-memory)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkLoginAttempts(email: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(email);

  if (!attempt || now > attempt.resetAt) {
    loginAttempts.set(email, { count: 1, resetAt: now + 15 * 60 * 1000 }); // 15 minutes
    return true;
  }

  if (attempt.count >= 5) {
    return false; // Too many attempts
  }

  attempt.count++;
  return true;
}

export function resetLoginAttempts(email: string): void {
  loginAttempts.delete(email);
}
