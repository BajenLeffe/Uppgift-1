import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { requestRoutes } from './routes/request.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { initializeAdmin } from './controllers/auth.controller.js';

const app = express();

app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', requestRoutes);
app.use('/auth', authRoutes);

// Initialize admin user on startup
initializeAdmin().catch(err => {
  console.error('[auth] Error initializing admin:', err);
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
});
