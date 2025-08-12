import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { validationResult } from 'express-validator';
import config from '../config/config.js';
import { db } from '../database/index.js';

const verifyTelegramAuth = (authData) => {
  const { hash, ...data } = authData;
  
  const dataCheckString = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('\n');
  
  const secret = crypto
    .createHash('sha256')
    .update(config.telegram.botToken)
    .digest();
  
  const calculatedHash = crypto
    .createHmac('sha256', secret)
    .update(dataCheckString)
    .digest('hex');
  
  return calculatedHash === hash;
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// Login or register user
const telegramLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const authData = req.body;
    
    if (!verifyTelegramAuth(authData)) {
      return res.status(401).json({ error: 'Invalid authentication data' });
    }
    
    const authDate = new Date(authData.auth_date * 1000);
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    
    if (authDate < tenMinutesAgo) {
      return res.status(401).json({ error: 'Authentication data is too old' });
    }
    
    const { id, first_name, last_name, username, photo_url } = authData;
    
    // Find or create user
    const [user] = await db.User.findOrCreate({
      where: { id },
      defaults: {
        id,
        first_name,
        last_name,
        username,
        photo_url,
        last_login: new Date(),
      },
    });
    
    user.last_login = new Date();
    await user.save();
    
    const token = generateToken(user);
    
    res.json({
      status: 'success',
      user: user,
      data: {
        user: {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          photo_url: user.photo_url,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Telegram login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'first_name', 'last_name'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = generateToken(user);

    res.json({
      status: 'success',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export { telegramLogin, getCurrentUser };
