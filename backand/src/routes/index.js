import { Router } from 'express';
import { body } from 'express-validator';
import { telegramLogin, getCurrentUser } from '../controllers/authController.js';
import getLatestPrices from '../controllers/priceController.js';
import auth from '../middleware/auth.js';

const router = Router();

// Auth routes
router.post(
  '/auth/telegram',
  [
    body('id').isNumeric(),
    body('first_name').optional().isString(),
    body('last_name').optional().isString(),
    body('username').optional().isString(),
    body('photo_url').optional().isString(),
    body('auth_date').isNumeric(),
    body('hash').isString(),
  ],
  telegramLogin
);

router.get('/auth/me', auth, getCurrentUser);

router.get('/prices/latest', getLatestPrices);

router.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

router.use((err, req, res, next) => {
  console.error('Route error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const setupRoutes = (app) => {
  app.use('/api', router);
};

export default setupRoutes;
