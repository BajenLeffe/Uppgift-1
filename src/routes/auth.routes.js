import { Router } from 'express';
import { showLogin, showSignup, signup, login, logout } from '../controllers/auth.controller.js';

export const authRoutes = Router();

authRoutes.get('/login', showLogin);
authRoutes.post('/login', login);
authRoutes.get('/signup', showSignup);
authRoutes.post('/signup', signup);
authRoutes.get('/logout', logout);
