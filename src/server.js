import express from 'express';
import helmet from 'helmet';
import { requestRoutes } from './routes/request.routes.js';

const app = express();

app.use(helmet());
app.use(express.urlencoded({ extended: false }));

app.use('/', requestRoutes);

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
});
