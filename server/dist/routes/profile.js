"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRouter = void 0;
const express_1 = require("express");
const Profile_1 = require("../models/Profile");
const auth_1 = require("../utils/auth");
exports.profileRouter = (0, express_1.Router)();
// All profile operations require auth
exports.profileRouter.use(auth_1.requireAuth);
exports.profileRouter.get('/me', async (req, res) => {
    const userId = req.user.id;
    const doc = await Profile_1.ProfileModel.findOne({ userId });
    if (!doc)
        return res.json({
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
exports.profileRouter.put('/me', async (req, res) => {
    const userId = req.user.id;
    const { name, age, gender, level, flexibility, goal, pcosOrPcod } = req.body || {};
    const payload = { userId };
    if (name)
        payload.name = name;
    if (typeof age === 'number')
        payload.age = age;
    if (gender)
        payload.gender = gender;
    if (level)
        payload.level = level;
    if (flexibility)
        payload.flexibility = flexibility;
    if (goal)
        payload.goal = goal;
    if (typeof pcosOrPcod === 'boolean')
        payload.pcosOrPcod = pcosOrPcod;
    const doc = await Profile_1.ProfileModel.findOneAndUpdate({ userId }, payload, { new: true, upsert: true });
    res.json(doc);
});
//# sourceMappingURL=profile.js.map