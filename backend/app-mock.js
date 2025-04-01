
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());

const clients = [];

app.get('/events', (req, res) => {
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
});

const sendMockData = () => {
  const now = new Date().toISOString();

  const mockEvents = [
    {
      id: 'engagementMetrics',
      timestamp: now,
      totalScore: Math.floor(Math.random() * 100000),
      avgScore: Math.random() * 500,
      avgComments: Math.random() * 50,
      topScores: [11499, 3000, 2500].map(x => x + Math.floor(Math.random() * 500)),
    },
    {
      id: 'postMetrics',
      timestamp: now,
      postCount: Math.floor(Math.random() * 300),
      postCount_cityMatch: Math.floor(Math.random() * 200),
      uniqueAuthors: Math.floor(Math.random() * 150),
      avgTitleLength: Math.random() * 100,
      postsWithImages: Math.floor(Math.random() * 150),
      selfPosts: Math.floor(Math.random() * 100),
      linkPosts: Math.floor(Math.random() * 100),
    },
    {
      id: 'locationMetrics',
      timestamp: now,
      city: 'Munich',
      latitude: 48.1351,
      longitude: 11.582,
      timezone: 'CET',
      continent: 'Europe',
      temperature: `${(20 + Math.random() * 10).toFixed(2)} °C`,
      humidity: `${(10 + Math.random() * 90).toFixed(2)} %`,
    }
  ];

  clients.forEach(res => {
    mockEvents.forEach(event => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });
  });
};

setInterval(sendMockData, 3000);

app.listen(PORT, () => {
  console.log(`Mock SSE server running on ${PORT}`);
});
