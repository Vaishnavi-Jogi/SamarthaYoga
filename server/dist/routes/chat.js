"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const express_1 = require("express");
const openrouter_1 = require("../services/openrouter");
const auth_1 = require("../utils/auth");
const Asana_1 = require("../models/Asana");
exports.chatRouter = (0, express_1.Router)();
exports.chatRouter.use(auth_1.requireAuth);
exports.chatRouter.post('/', async (req, res) => {
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
        const doc = await Asana_1.AsanaModel.findOne({ asana_name: new RegExp(`^${asana_name}$`, 'i') });
        if (doc) {
            kb = `Alignment: ${doc.alignment.join('; ')}\nMistakes: ${doc.mistakes.join('; ')}\nEffects: ${doc.benefits.join('; ')}\nPrecautions: ${doc.precautions.join('; ')}`;
        }
    }
    const preface = `You are a classical yoga teacher drawing on Hatha Yoga Pradipika and Light on Yoga.\n` +
        (asana_name ? `Pose: ${asana_name}.\n` : '') +
        (kb ? `${kb}\n` : '') +
        `Only answer yoga-related questions. Be concise, kind, and clear.`;
    const answer = await (0, openrouter_1.chatWithOpenRouter)(`${preface}\n\nUser: ${user_prompt || 'Give me feedback and a 2-step improvement plan.'}`);
    res.json({ message: answer });
});
//# sourceMappingURL=chat.js.map