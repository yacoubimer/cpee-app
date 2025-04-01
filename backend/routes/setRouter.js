import express from 'express';
const setRouter = express.Router();

// In-memory store for instance data
let instanceStore = {};

/**
 * Initialize or update an instance with a keyword.
 */
setRouter.put('/', (req, res) => {
  const { instanceId, keyword } = req.body;

  if (!instanceId || !keyword) {
    return res.status(400).json({ error: 'instanceId and keyword are required in JSON body' });
  }
  // Save to instanceStore
  instanceStore[instanceId] = { instanceId, keyword };

  res.json({ message: `Instance ${instanceId} set with keyword '${keyword}'`, instance: instanceStore[instanceId] });
});

/**
 * GET /reddit/set/:instanceId
 * Retrieve info about a given instance.
 */
setRouter.get('/:instanceId', (req, res) => {
  const { instanceId } = req.params;
  const instance = instanceStore[instanceId];
  if (!instance) {
    return res.status(404).json({ error: 'Instance not found' });
  }
  res.json(instance);
});

export { setRouter, instanceStore };
