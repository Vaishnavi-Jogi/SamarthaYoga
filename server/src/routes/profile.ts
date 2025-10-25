import { Router } from 'express';
import { ProfileModel } from '../models/Profile';
import { requireAuth } from '../utils/auth';

export const profileRouter = Router();

// All profile operations require auth
profileRouter.use(requireAuth);

profileRouter.get('/me', async (req: any, res) => {
  const userId = req.user.id;
  const doc = await ProfileModel.findOne({ userId });
  if (!doc) return res.json({
    userId,
    name: 'Guest',
    age: 30,
    gender: 'other',
    level: 'beginner',
    flexibility: 'medium',
    goal: 'alignment',
  });
  res.json(doc);
});

profileRouter.put('/me', async (req: any, res) => {
  const userId = req.user.id;
  const { name, age, gender, level, flexibility, goal, pcosOrPcod } = req.body || {};
  const payload: any = { userId };
  if (name) payload.name = name;
  if (typeof age === 'number') payload.age = age;
  if (gender) payload.gender = gender;
  if (level) payload.level = level;
  if (flexibility) payload.flexibility = flexibility;
  if (goal) payload.goal = goal;
  if (typeof pcosOrPcod === 'boolean') payload.pcosOrPcod = pcosOrPcod;
  const doc = await ProfileModel.findOneAndUpdate({ userId }, payload, { new: true, upsert: true });
  res.json(doc);
});
