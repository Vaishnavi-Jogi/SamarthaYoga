"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const auth_1 = require("../utils/auth");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/register', async (req, res) => {
    const { email, password, name, age, gender, level, flexibility, goal, pcosOrPcod } = req.body || {};
    if (!email || !password)
        return res.status(400).json({ error: 'email and password required' });
    const existing = await User_1.UserModel.findOne({ email });
    if (existing)
        return res.status(409).json({ error: 'Email already registered' });
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await User_1.UserModel.create({ email, passwordHash });
    const token = (0, auth_1.signToken)({ id: user._id.toString(), email: user.email });
    // Create initial profile if provided
    if (name && age && gender && level) {
        const { ProfileModel } = await Promise.resolve().then(() => __importStar(require('../models/Profile')));
        await ProfileModel.findOneAndUpdate({ userId: user._id }, { userId: user._id, name, age, gender, level, flexibility: flexibility || 'medium', goal, pcosOrPcod }, { upsert: true });
    }
    res.json({ token });
});
exports.authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password)
        return res.status(400).json({ error: 'email and password required' });
    const user = await User_1.UserModel.findOne({ email });
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = (0, auth_1.signToken)({ id: user._id.toString(), email: user.email });
    res.json({ token });
});
exports.authRouter.get('/me', auth_1.requireAuth, async (req, res) => {
    res.json({ id: req.user.id, email: req.user.email });
});
//# sourceMappingURL=auth.js.map