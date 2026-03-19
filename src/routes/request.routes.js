import { Router } from 'express';
import { listMessages, sendMessage, showForm } from '../controllers/request.controller.js';

export const requestRoutes = Router();

requestRoutes.get('/', showForm);
requestRoutes.post('/send', sendMessage);
requestRoutes.get('/messages', listMessages);
