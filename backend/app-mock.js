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

  // Updated postMetrics event matching your data structure
  const postMetricsEvent = {
    instanceId: '53884',
    id: 'postMetrics',
    timestamp: now,
    source: 'reddit',
    city: 'Munich',
    keyword: 'cpee',
    postCount: Math.floor(Math.random() * 300),
    postCount_cityMatch: Math.floor(Math.random() * 200),
    uniqueAuthors: Math.floor(Math.random() * 150),
    avgTitleLength: parseFloat((Math.random() * 100).toFixed(2)),
    totalTitleWords: Math.floor(Math.random() * 3000),
    avgTitleWords: parseFloat((5 + Math.random() * 10).toFixed(2)),
    postsWithImages: Math.floor(Math.random() * 150),
    nsfwPosts: Math.floor(Math.random() * 50),
    selfPosts: Math.floor(Math.random() * 100),
    linkPosts: Math.floor(Math.random() * 100),
  };

  // Updated engagementMetrics event matching your data structure
  const engagementMetricsEvent = {
    instanceId: '53884',
    id: 'engagementMetrics',
    timestamp: now,
    source: 'reddit',
    city: 'Munich',
    keyword: 'cpee',
    postCount: postMetricsEvent.postCount, // mirror for consistency
    totalScore: Math.floor(Math.random() * 100000),
    totalComments: Math.floor(Math.random() * 10000),
    avgScore: parseFloat((Math.random() * 500).toFixed(2)),
    avgComments: parseFloat((Math.random() * 50).toFixed(2)),
    maxScore: Math.floor(Math.random() * 12000),
    minScore: 0,
    scoreStdDev: parseFloat((Math.random() * 1000).toFixed(2)),
    medianScore: Math.floor(Math.random() * 50),
    scoreRange: Math.floor(Math.random() * 12000),
    commentRatio: parseFloat((Math.random() * 100).toFixed(2)),
    topScores: [
      Math.floor(Math.random() * 12000),
      Math.floor(Math.random() * 12000),
      Math.floor(Math.random() * 12000),
      Math.floor(Math.random() * 12000),
      Math.floor(Math.random() * 12000)
    ],
    topUpvotes: [1, 1, 1, 1, 1],
    avgUpvoteRatio: parseFloat((Math.random()).toFixed(2)),
    totalAwards: Math.floor(Math.random() * 10),
  };

  // Location metrics event remains similar
  const locationMetricsEvent = {
    instanceId: '53884',
    id: 'locationMetrics',
    timestamp: now,
    city: 'Munich',
    latitude: 48.1351,
    longitude: 11.582,
    timezone: 'CET',
    continent: 'Europe',
    temperature: `${(20 + Math.random() * 10).toFixed(2)} °C`,
    humidity: `${(10 + Math.random() * 90).toFixed(2)} %`,
  };

  const mockEvents = [
    engagementMetricsEvent,
    postMetricsEvent,
    locationMetricsEvent,
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
