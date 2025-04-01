const clients = [];

export const eventsHandler = (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  res.flushHeaders();
  clients.push(res);

  req.on('close', () => {
    const index = clients.indexOf(res);
    if (index !== -1) clients.splice(index, 1);
  });
};

export const sendToFrontend = (data) => {
  const json = JSON.stringify(data);
  clients.forEach(client => {
    client.write(`data: ${json}\n\n`);
  });
};
