import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { verifyFirebaseToken } from './middleware/authMiddleware.js';
import { loginUser, registerUser } from './services/auth.js';
import { getUserDashboardStats } from './services/user.js';

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

const responseData = (record) => ({ user: (({ progression, universe, ...user }) => user)(record), progression: record.progression, universe: record.universe });

app.get('/api/health', (_req, res) => res.json({ success: true, message: 'Backend is running' }));

app.post('/api/auth/register', verifyFirebaseToken, async (req, res, next) => {
  try {
    const result = await registerUser(req.user);
    if (result.status === 'already-registered') {
      return res.status(409).json({ success: false, code: 'USER_ALREADY_REGISTERED', message: 'User already registered. Please use Enter to log in.' });
    }
    return res.status(201).json({ success: true, message: 'Your journey has been created successfully.', ...responseData(result.data) });
  } catch (error) { return next(error); }
});

app.post('/api/auth/login', verifyFirebaseToken, async (req, res, next) => {
  try {
    const result = await loginUser(req.user);
    if (result.status === 'not-found') {
      return res.status(404).json({ success: false, code: 'USER_NOT_FOUND', message: 'User not found. Please register first.' });
    }
    return res.json({ success: true, message: 'Welcome back. Your universe has been restored.', ...responseData(result.data) });
  } catch (error) { return next(error); }
});

app.get('/api/users/me/stats', verifyFirebaseToken, async (req, res, next) => {
  try {
    const stats = await getUserDashboardStats(req.user.uid);
    if (!stats) return res.status(404).json({ success: false, code: 'USER_NOT_FOUND', message: 'User not found. Please register first.' });
    return res.json({ success: true, ...stats });
  } catch (error) { return next(error); }
});

app.use((error, _req, res, _next) => {
  console.error('Unhandled API error:', error.code || error.message);
  res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
});

app.listen(port, () => console.log(`Life RPG backend listening on port ${port}`));
