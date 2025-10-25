"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityRouter = void 0;
const express_1 = require("express");
const dayjs_1 = __importDefault(require("dayjs"));
const auth_1 = require("../utils/auth");
const Activity_1 = require("../models/Activity");
exports.activityRouter = (0, express_1.Router)();
exports.activityRouter.use(auth_1.requireAuth);
exports.activityRouter.get('/streak', async (req, res) => {
    const userId = req.user.id;
    const start = (0, dayjs_1.default)().subtract(29, 'day');
    const dates = new Set((await Activity_1.ActivityModel.find({ userId, date: { $gte: start.format('YYYY-MM-DD') } })).map(d => d.date));
    const items = Array.from({ length: 30 }, (_, i) => start.add(i, 'day').format('YYYY-MM-DD')).map(date => ({ date, done: dates.has(date) }));
    res.json({ items });
});
exports.activityRouter.post('/mark', async (req, res) => {
    const userId = req.user.id;
    const { type = 'upload', date = (0, dayjs_1.default)().format('YYYY-MM-DD'), meta = {} } = req.body || {};
    const doc = await Activity_1.ActivityModel.findOneAndUpdate({ userId, type, date }, { userId, type, date, meta }, { new: true, upsert: true });
    res.json(doc);
});
//# sourceMappingURL=activity.js.map