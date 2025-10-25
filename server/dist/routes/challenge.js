"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.challengeRouter = void 0;
const express_1 = require("express");
const dayjs_1 = __importDefault(require("dayjs"));
const auth_1 = require("../utils/auth");
const Profile_1 = require("../models/Profile");
exports.challengeRouter = (0, express_1.Router)();
exports.challengeRouter.use(auth_1.requireAuth);
function buildPlan(input) {
    // very simple rules for MVP
    const base = [
        'Tadasana', 'Adho Mukha Svanasana', 'Virabhadrasana II', 'Trikonasana', 'Bhujangasana', 'Setu Bandhasana', 'Balasana'
    ];
    let list = base;
    if (input.gender === 'female' && input.pcosOrPcod) {
        list = ['Supta Baddha Konasana', 'Setu Bandhasana', 'Bhujangasana', 'Adho Mukha Svanasana', 'Balasana', 'Viparita Karani', 'Marjaryasana'];
    }
    if (input.conditions.includes('thyroid')) {
        list = ['Sarvangasana', 'Matsyasana', ...list];
    }
    if (input.level === 'beginner')
        list = list.map(x => x + ' (gentle)');
    if (input.level === 'advanced')
        list = list.map(x => x + ' (advanced holds)');
    const days = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, asana: list[i % list.length] }));
    return { days };
}
exports.challengeRouter.post('/generate', async (req, res) => {
    const userId = req.user.id;
    const { conditions = [], pcosOrPcod } = req.body || {};
    const profile = await Profile_1.ProfileModel.findOne({ userId });
    if (!profile)
        return res.status(400).json({ error: 'Complete profile first' });
    const plan = buildPlan({ gender: profile.gender, pcosOrPcod, level: profile.level, conditions });
    res.json({ start: (0, dayjs_1.default)().format('YYYY-MM-DD'), plan });
});
//# sourceMappingURL=challenge.js.map