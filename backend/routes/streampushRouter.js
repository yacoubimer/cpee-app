import express from 'express';
import { sendToFrontend } from './sseRouter.js';

const streamPushRouter = express.Router();
const activeInstances = new Set();

function markInstanceActive(instanceId) {
  activeInstances.add(instanceId);
}

export function registerInstanceId(instanceId) {
  if (instanceId) markInstanceActive(instanceId.toString());
}

function isInstanceActive(instanceId) {
  return activeInstances.has(instanceId?.toString());
}

streamPushRouter.post('/', express.raw({ type: '*/*', limit: '2mb' }), (req, res) => {
  try {
    const raw = req.body.toString();

    const match = raw.match(/Content-Type: application\/json.*?({.*})/s);
    if (!match || !match[1]) {
      return res.status(400).json({ error: 'Invalid stream format' });
    }

    const parsed = JSON.parse(match[1]);
    const topic = parsed?.topic;
    const received = parsed?.content?.received?.[0]?.data;

    if (topic !== 'stream' || !received) {
      return res.status(200).json({ message: 'Stream ignored (non-stream or no received data)' });
    }

    let result;
    try {
      result = JSON.parse(received);
    } catch {
      return res.status(200).json({ message: 'Invalid received JSON. Skipped.' });
    }

    const instanceId = result?.instanceId;
    if (!instanceId || !isInstanceActive(instanceId)) {
      return res.status(200).json({ message: 'Instance not registered or ID missing' });
    }

    console.log('[ Data Pushed to Frontend ]\n', result); 

    sendToFrontend(result);
    res.status(200).json({ message: 'Stream parsed and forwarded' });

  } catch (err) {
    res.status(500).send('Stream error');
  }
});

export { streamPushRouter };
