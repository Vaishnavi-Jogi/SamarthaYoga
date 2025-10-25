import { Router } from 'express';
import { chatWithOpenRouter } from '../services/openrouter';
import { requireAuth } from '../utils/auth';
import { AsanaModel } from '../models/Asana';

export const chatRouter = Router();
chatRouter.use(requireAuth);

chatRouter.post('/', async (req: any, res) => {
  const { asana_name, user_prompt } = req.body || {};
  const allowedTopics = ['asana', 'yoga', 'alignment', 'breath', 'pranayama', 'health', 'scripture', 'ayurveda', 'meditation'];
  const lower = String(user_prompt || '').toLowerCase();
  const isAllowed = allowedTopics.some((k) => lower.includes(k));
  if (!asana_name && !isAllowed) {
    return res.json({ message: 'I only answer yoga/asana/health/scripture related questions.' });
  }

  // pull classical knowledge base from DB if asana provided
  let kb = '';
  if (asana_name) {
    const doc = await AsanaModel.findOne({ asana_name: new RegExp(`^${asana_name}$`, 'i') });
    if (doc) {
      kb = `Alignment: ${doc.alignment.join('; ')}\nMistakes: ${doc.mistakes.join('; ')}\nEffects: ${doc.benefits.join('; ')}\nPrecautions: ${doc.precautions.join('; ')}`;
    }
  }

  const preface = `You are a classical yoga teacher drawing on Hatha Yoga Pradipika and Light on Yoga.\n` +
    (asana_name ? `Pose: ${asana_name}.\n` : '') +
    (kb ? `${kb}\n` : '') +
    `Only answer yoga-related questions. Be concise, kind, and clear.`;

  const answer = await chatWithOpenRouter(`${preface}\n\nUser: ${user_prompt || 'Give me feedback and a 2-step improvement plan.'}`);
  res.json({ message: answer });
});
