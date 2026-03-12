import { Router } from 'express';
import { getForm } from '../controllers/mainController.js';
import { sendMessage, getMessages } from '../controllers/messageController.js';

const router = Router();

// GET /: visar formulär
router.get('/', getForm);

// POST /send: tar emot input + sparar i Supabase
router.post('/send', sendMessage);

// GET /messages: visar alla meddelanden från databasen
router.get('/messages', getMessages);

export default router;
