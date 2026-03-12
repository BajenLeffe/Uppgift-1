import express from 'express';
import helmet from 'helmet';
import routes from './routes/index.js';

const app = express();

// --- Basic server hardening (enkelt men bra vana)
app.use(helmet());
app.use(express.urlencoded({ extended: false })); // för HTML-form (application/x-www-form-urlencoded)

const PORT = Number(process.env.PORT || 3000);

// Använd alla routes
app.use(routes);


app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
});
