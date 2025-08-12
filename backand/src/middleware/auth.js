import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { db } from '../database/index.js';

export const auth = async (req, res, next) => {
  
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    
    const decoded = jwt.verify(token, config.jwt.secret);
    
    const user = await db.User.findByPk(decoded.id, {
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });

    console.log('User found:', user);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      token: token ? 'Token exists' : 'No token',
      decoded: decoded || 'Not decoded',
      timestamp: new Date().toISOString()
    });
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        details: error.message 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        expiredAt: error.expiredAt 
      });
    }
    
    if (error.name === 'SequelizeDatabaseError' || error.name === 'SequelizeConnectionError') {
      console.error('Database error in auth middleware:', error);
      return res.status(503).json({ 
        error: 'Database error',
        message: 'Unable to authenticate due to database issues' 
      });
    }
    
    res.status(500).json({ 
      error: 'Authentication failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default auth;
