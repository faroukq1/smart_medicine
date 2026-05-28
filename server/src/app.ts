import express from 'express';
import cors from 'cors';
import { authRouter } from './modules/auth/auth.router';
import { usersRouter } from './modules/users/users.router';
import { patientsRouter } from './modules/patients/patients.router';
import { vitalsRouter } from './modules/vitals/vitals.router';
import { alertsRouter } from './modules/alerts/alerts.router';
import { devicesRouter } from './modules/devices/devices.router';
import { errorMiddleware } from './middleware/error.middleware';

export const app = express();

app.disable('etag');
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  const isPost = req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH';

  if (isPost && Object.keys(req.body).length) {
    console.log(`→ ${req.method} ${req.path}`, JSON.stringify(req.body));
  } else {
    console.log(`→ ${req.method} ${req.path}`);
  }

  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    console.log(`← ${res.statusCode} ${req.method} ${req.path} [${Date.now() - start}ms]`, JSON.stringify(body).slice(0, 300));
    return originalJson(body);
  };

  next();
});

app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

app.use('/api/auth',     authRouter);
app.use('/api/users',    usersRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/vitals',   vitalsRouter);
app.use('/api/alerts',   alertsRouter);
app.use('/api/devices',  devicesRouter);

app.use(errorMiddleware);
