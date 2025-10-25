import { Router } from 'express';
import dayjs from 'dayjs';
import { requireAuth } from '../utils/auth';
import { ProfileModel } from '../models/Profile';

export const challengeRouter = Router();
challengeRouter.use(requireAuth);

function buildPlan(input: { gender: string; pcosOrPcod?: boolean; conditions: string[]; level: string }) {
  // very simple rules for MVP
  const base: string[] = [
    'Tadasana', 'Adho Mukha Svanasana', 'Virabhadrasana II', 'Trikonasana', 'Bhujangasana', 'Setu Bandhasana', 'Balasana'
  ];
  let list = base;
  if (input.gender === 'female' && input.pcosOrPcod) {
    list = ['Supta Baddha Konasana', 'Setu Bandhasana', 'Bhujangasana', 'Adho Mukha Svanasana', 'Balasana', 'Viparita Karani', 'Marjaryasana'];
  }
  if (input.conditions.includes('thyroid')) {
    list = ['Sarvangasana', 'Matsyasana', ...list];
  }
  if (input.level === 'beginner') list = list.map(x => x + ' (gentle)');
  if (input.level === 'advanced') list = list.map(x => x + ' (advanced holds)');
  const days = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, asana: list[i % list.length] }));
  return { days };
}

challengeRouter.post('/generate', async (req: any, res) => {
  const userId = req.user.id;
  const { conditions = [], pcosOrPcod } = req.body || {};
  const profile = await ProfileModel.findOne({ userId });
  if (!profile) return res.status(400).json({ error: 'Complete profile first' });
  const plan = buildPlan({ gender: profile.gender, pcosOrPcod, level: profile.level, conditions });
  res.json({ start: dayjs().format('YYYY-MM-DD'), plan });
});
