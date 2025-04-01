const clientsByInstance = new Map();

export const eventsHandler = (req, res) => {
  const instanceId = req.query.instanceId;
  if (!instanceId) {
    res.status(400).json({ error: 'Missing instanceId in query' });
    return;
  }

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  res.flushHeaders();

  if (!clientsByInstance.has(instanceId)) {
    clientsByInstance.set(instanceId, []);
  }

  clientsByInstance.get(instanceId).push(res);

  req.on('close', () => {
    const updatedList = (clientsByInstance.get(instanceId) || []).filter(c => c !== res);
    if (updatedList.length) {
      clientsByInstance.set(instanceId, updatedList);
    } else {
      clientsByInstance.delete(instanceId);
    }
  });
};

// Only send to clients listening for this instanceId
export const sendToFrontend = (data) => {
  const json = JSON.stringify(data);
  clientsByInstance.get(instanceId).forEach(client => {
    client.write(`data: ${json}\n\n`);
  });
};
