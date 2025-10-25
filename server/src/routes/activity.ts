import { Router } from 'express';
import dayjs from 'dayjs';
import { requireAuth } from '../utils/auth';
import { ActivityModel } from '../models/Activity';

export const activityRouter = Router();
activityRouter.use(requireAuth);

activityRouter.get('/streak', async (req: any, res) => {
  const userId = req.user.id;
  const start = dayjs().subtract(29, 'day');
  const dates = new Set((await ActivityModel.find({ userId, date: { $gte: start.format('YYYY-MM-DD') } })).map(d => d.date));
  const items = Array.from({ length: 30 }, (_, i) => start.add(i, 'day').format('YYYY-MM-DD')).map(date => ({ date, done: dates.has(date) }));
  res.json({ items });
});

activityRouter.post('/mark', async (req: any, res) => {
  const userId = req.user.id;
  const { type = 'upload', date = dayjs().format('YYYY-MM-DD'), meta = {} } = req.body || {};
  const doc = await ActivityModel.findOneAndUpdate({ userId, type, date }, { userId, type, date, meta }, { new: true, upsert: true });
  res.json(doc);
});
