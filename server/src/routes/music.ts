import { Router } from 'express';
import { requireAuth } from '../utils/auth';

export const musicRouter = Router();
musicRouter.use(requireAuth);

const MOOD_MAP: Record<string, { title: string; url: string }[]> = {
  calm: [
    { title: 'Ocean Breath', url: 'https://example.com/audio/ocean-breath.mp3' },
    { title: 'Evening Raga', url: 'https://example.com/audio/evening-raga.mp3' },
  ],
  focused: [
    { title: 'Tanpura Drone', url: 'https://example.com/audio/tanpura-drone.mp3' },
  ],
  energize: [
    { title: 'Sun Salute Beats', url: 'https://example.com/audio/sun-salute.mp3' },
  ],
};

// in-memory favorites for MVP; replace with DB if needed
const favorites: Record<string, { title: string; url: string }[]> = {};

musicRouter.get('/tracks', (req: any, res) => {
  const mood = String(req.query.mood || 'calm').toLowerCase();
  res.json({ tracks: MOOD_MAP[mood] || MOOD_MAP['calm'], favorites: favorites[req.user.id] || [] });
});

musicRouter.post('/favorites', (req: any, res) => {
  const { track } = req.body || {};
  if (!track) return res.status(400).json({ error: 'track required' });
  favorites[req.user.id] = favorites[req.user.id] || [];
  const list = favorites[req.user.id];
  if (!list.find((t) => t.url === track.url)) list.unshift(track);
  res.json({ favorites: favorites[req.user.id] });
});
