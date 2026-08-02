/**
 * Authentication Routes
 * Login, Register, Logout endpoints
 */

import express, { Response } from 'express';
import { db, dbType } from '../config/database.js';
import {
  hashPassword,
  comparePassword,
  generateToken,
  createSession,
  deleteSession,
  checkLoginAttempts,
  resetLoginAttempts,
  verifyToken,
  AuthRequest
} from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validation
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (!['student', 'instructor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    let existingUser;
    if (dbType === 'postgres') {
      const result = await (db as any).query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
      existingUser = result.rows[0];
    } else {
      existingUser = (db as any).prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    }

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = uuidv4();
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    if (dbType === 'postgres') {
      await (db as any).query(
        `INSERT INTO users (id, email, password_hash, name, role, avatar, skills, preferred_mode, availability)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [userId, email.toLowerCase(), passwordHash, name, role, avatar, [], 'Hybrid', 'Not set']
      );
    } else {
      (db as any).prepare(
        `INSERT INTO users (id, email, password_hash, name, role, avatar, skills, preferred_mode, availability)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(userId, email.toLowerCase(), passwordHash, name, role, avatar, JSON.stringify([]), 'Hybrid', 'Not set');
    }

    // Generate token
    const token = generateToken({ id: userId, email, role, name });
    await createSession(userId, token);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        name,
        role,
        avatar,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check login attempts
    if (!checkLoginAttempts(email)) {
      return res.status(429).json({ error: 'Too many login attempts. Please try again in 15 minutes.' });
    }

    // Find user
    let user: any;
    if (dbType === 'postgres') {
      const result = await (db as any).query(
        'SELECT id, email, password_hash, name, role, avatar FROM users WHERE email = $1 AND is_active = true',
        [email.toLowerCase()]
      );
      user = result.rows[0];
    } else {
      user = (db as any).prepare(
        'SELECT id, email, password_hash, name, role, avatar FROM users WHERE email = ? AND is_active = 1'
      ).get(email.toLowerCase());
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Reset login attempts on successful login
    resetLoginAttempts(email);

    // Update login count
    if (dbType === 'postgres') {
      await (db as any).query(
        'UPDATE users SET login_count = login_count + 1 WHERE id = $1',
        [user.id]
      );
    } else {
      (db as any).prepare('UPDATE users SET login_count = login_count + 1 WHERE id = ?').run(user.id);
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });
    await createSession(user.id, token);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout user
router.post('/logout', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const token = req.headers.authorization?.substring(7);
    
    if (token && req.user) {
      await deleteSession(req.user.id, token);
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user profile
router.get('/me', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let user: any;
    if (dbType === 'postgres') {
      const result = await (db as any).query(
        `SELECT id, email, name, role, avatar, skills, preferred_mode, availability, 
         login_count, material_views_count, discussion_count, created_at
         FROM users WHERE id = $1`,
        [req.user.id]
      );
      user = result.rows[0];
    } else {
      user = (db as any).prepare(
        `SELECT id, email, name, role, avatar, skills, preferred_mode, availability,
         login_count, material_views_count, discussion_count, created_at
         FROM users WHERE id = ?`
      ).get(req.user.id);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Parse skills if it's a string (SQLite)
    if (typeof user.skills === 'string') {
      user.skills = JSON.parse(user.skills);
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, skills, preferred_mode, availability, avatar } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = ${dbType === 'postgres' ? '$' + paramCount++ : '?'}`);
      values.push(name);
    }
    if (skills) {
      updates.push(`skills = ${dbType === 'postgres' ? '$' + paramCount++ : '?'}`);
      values.push(dbType === 'postgres' ? skills : JSON.stringify(skills));
    }
    if (preferred_mode) {
      updates.push(`preferred_mode = ${dbType === 'postgres' ? '$' + paramCount++ : '?'}`);
      values.push(preferred_mode);
    }
    if (availability) {
      updates.push(`availability = ${dbType === 'postgres' ? '$' + paramCount++ : '?'}`);
      values.push(availability);
    }
    if (avatar) {
      updates.push(`avatar = ${dbType === 'postgres' ? '$' + paramCount++ : '?'}`);
      values.push(avatar);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.user.id);

    const query = `UPDATE users SET ${updates.join(', ')}, updated_at = ${
      dbType === 'postgres' ? 'CURRENT_TIMESTAMP' : 'CURRENT_TIMESTAMP'
    } WHERE id = ${dbType === 'postgres' ? '$' + paramCount : '?'}`;

    if (dbType === 'postgres') {
      await (db as any).query(query, values);
    } else {
      (db as any).prepare(query).run(...values);
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get current password hash
    let user: any;
    if (dbType === 'postgres') {
      const result = await (db as any).query(
        'SELECT password_hash FROM users WHERE id = $1',
        [req.user.id]
      );
      user = result.rows[0];
    } else {
      user = (db as any).prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    if (dbType === 'postgres') {
      await (db as any).query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newPasswordHash, req.user.id]
      );
    } else {
      (db as any).prepare(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(newPasswordHash, req.user.id);
    }

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;
