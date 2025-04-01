import 'dotenv/config';
import express from 'express';

import { oauthRouter } from './routes/oauth.js';
import { setRouter } from './routes/setRouter.js';
import { postCountRouter } from './routes/postcountRouter.js';
import { engagementRouter } from './routes/engagementRouter.js';
import { userActionsRouter } from './routes/userActions.js';
import { locationRouter } from './routes/locationRouter.js';
import { keywordRouter } from './routes/keywordRouter.js';
import { streamPushRouter } from './routes/streampushRouter.js';
import { eventsHandler } from './routes/sseRouter.js';
import { postSelectorRouter } from './routes/postSelector.js'; 

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Normal app routes
app.use('/reddit/oauth', oauthRouter);
app.use('/reddit/set', setRouter);
app.use('/reddit/data', postCountRouter);
app.use('/reddit/data', engagementRouter);
app.use('/reddit/actions', userActionsRouter);
app.use('/reddit/sensor', locationRouter);
app.use('/reddit/keywords', keywordRouter);
app.use('/reddit', postSelectorRouter); 
app.get('/reddit/events', eventsHandler);

// Handle CPEE stream
app.post('/', express.raw({ type: '*/*', limit: '2mb' }), (req, res, next) => {
  streamPushRouter.handle(req, res, next);
});

// Start server
const PORT = process.env.PORT || 3036;
app.listen(PORT, () => {
  console.log(`Node app listening on port ${PORT}`);
});
