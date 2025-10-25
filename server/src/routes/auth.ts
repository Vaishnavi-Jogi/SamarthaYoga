import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { signToken, requireAuth } from '../utils/auth';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const { email, password, name, age, gender, level, flexibility, goal, pcosOrPcod } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const existing = await UserModel.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ email, passwordHash });
  const token = signToken({ id: (user._id as any).toString(), email: user.email });
  // Create initial profile if provided
  if (name && age && gender && level) {
    const { ProfileModel } = await import('../models/Profile');
    await ProfileModel.findOneAndUpdate(
      { userId: user._id },
      { userId: user._id, name, age, gender, level, flexibility: flexibility || 'medium', goal, pcosOrPcod },
      { upsert: true }
    );
  }
  res.json({ token });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = await UserModel.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken({ id: (user._id as any).toString(), email: user.email });
  res.json({ token });
});

authRouter.get('/me', requireAuth, async (req: any, res) => {
  res.json({ id: req.user.id, email: req.user.email });
});
