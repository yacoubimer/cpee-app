import express from 'express';
import fetch from 'node-fetch';

const keywordRouter = express.Router();

const fallbackKeywords = [
  'green technology',
  'urban farming',
  'ethical AI',
  'space tourism',
  'climate adaptation',
  'digital privacy'
];

// Helper to fetch post data
async function fetchRedditData(keyword) {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&limit=100`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'TUM-Reddit-Project/1.0' }
  });
  if (!response.ok) throw new Error('Reddit API error');
  const data = await response.json();
  return data.data.children;
}

//  POST /reddit/keywords/check-keyword
// Body: { "keyword": "your-keyword" }
keywordRouter.post('/check-keyword', async (req, res) => {
  const keyword = req.body.keyword;
  if (!keyword) return res.status(400).json({ error: 'Missing keyword' });

  try {
    const posts = await fetchRedditData(keyword);
    const totalScore = posts.reduce((sum, p) => sum + (p.data.score || 0), 0);

    const result = {
      keyword,
      postCount: posts.length,
      totalScore,
      status: posts.length < 10 || totalScore < 100 ? 'low' : 'good'
    };

    res.json(result);
  } catch (err) {
    console.error('Keyword check error:', err.message);
    res.status(500).json({ error: 'Failed to fetch keyword data' });
  }
});

// GET /reddit/keywords/suggest-keyword
keywordRouter.get('/suggest-keyword', async (req, res) => {
  const suggestions = [
    'AI healthcare',
    'electric vehicles',
    'spaceX mission',
    'renewable energy',
    'climate innovation',
    'cybersecurity trends'
  ];

  for (const keyword of suggestions) {
    try {
      const posts = await fetchRedditData(keyword);
      const score = posts.reduce((sum, p) => sum + (p.data.score || 0), 0);

      if (posts.length >= 20 && posts.length < 500 && score > 100) {
        return res.json({
          suggested: keyword,
          postCount: posts.length,
          totalScore: score
        });
      }
    } catch (e) {
      console.warn(`Skipping ${keyword}: ${e.message}`);
    }
  }

  // fallback if no suitable live keyword found
  const fallback = fallbackKeywords[Math.floor(Math.random() * fallbackKeywords.length)];
  res.json({ suggested: fallback, note: 'Fallback keyword used' });
});

export { keywordRouter };
