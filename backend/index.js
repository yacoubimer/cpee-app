import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { oauthRouter } from './routes/oauth.js';
import { setRouter } from './routes/setRouter.js';
import { postCountRouter } from './routes/postcountRouter.js';
import { engagementRouter } from './routes/engagementRouter.js';
import { userActionsRouter } from './routes/userActions.js';
import { locationRouter } from './routes/locationRouter.js';
import { keywordRouter } from './routes/keywordRouter.js';
import { streamPushRouter } from './routes/streampushRouter.js';
import { eventsHandler } from './routes/sseRouter.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API ROUTES ---
app.use('/reddit/oauth', oauthRouter);
app.use('/reddit/set', setRouter);
app.use('/reddit/data', postCountRouter);
app.use('/reddit/data', engagementRouter);
app.use('/reddit/actions', userActionsRouter);
app.use('/reddit/sensor', locationRouter);
app.use('/reddit/keywords', keywordRouter);
app.get('/reddit/events', eventsHandler);

// --- CPEE Stream Push Handler (POST /) ---
app.post('/', express.raw({ type: '*/*', limit: '2mb' }), (req, res, next) => {
  streamPushRouter.handle(req, res, next);
});

// --- FRONTEND: Serve Static Files ---
app.use(express.static(path.join(__dirname, 'public')));

// --- FRONTEND: Catch-all GET (for SPA routing) ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Start Server ---
const PORT = process.env.PORT || 3036;
app.listen(PORT, () => {
  console.log(`Node app listening on port ${PORT}`);
});
