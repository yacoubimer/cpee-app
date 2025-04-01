import express from 'express';
import fetch from 'node-fetch';
import { instanceStore } from './setRouter.js';
import { registerInstanceId } from './streampushRouter.js';

const postCountRouter = express.Router();

postCountRouter.get('/postCount', async (req, res) => {
  const instanceId = req.query.instanceId;
  const callback = req.headers['cpee-callback'];
  const keyword = req.query.keyword;

  if (!instanceId) return res.status(400).json({ error: 'Missing instanceId in query' });
  if (!keyword) return res.status(400).json({ error: 'Missing keyword in query' });

  registerInstanceId(instanceId);

  const instance = instanceStore[instanceId];
  const city = instance?.city || 'unknown';

  try {
    const headers = { 'User-Agent': 'TUM-Reddit-Project/1.0' };
    const maxPosts = 500;
    const posts = [];
    let after = null;

    while (posts.length < maxPosts) {
      const limit = Math.min(100, maxPosts - posts.length);
      const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&limit=${limit}${after ? `&after=${after}` : ''}`;
      const response = await fetch(url, { headers });

      if (!response.ok) {
        return res.status(500).json({ error: 'Reddit API fetch failed' });
      }

      const data = await response.json();
      const newPosts = data.data?.children || [];

      if (!newPosts.length) break;

      posts.push(...newPosts);
      after = data.data.after;
      if (!after) break;
    }

    const timestamp = new Date().toISOString();
    const authors = new Set();
    let totalTitleLength = 0, postsWithImages = 0, nsfwPosts = 0, totalWords = 0, selfPosts = 0;
    let postCount_cityMatch = 0;

    posts.forEach(post => {
      const p = post.data;
      const title = p.title || '';

      if (title.toLowerCase().includes(city.toLowerCase())) {
        postCount_cityMatch++;
      }

      authors.add(p.author);
      totalTitleLength += title.length;
      totalWords += title.split(' ').length;
      if (p.preview || p.url?.match(/\.(jpg|png|gif)/i)) postsWithImages++;
      if (p.over_18) nsfwPosts++;
      if (p.is_self) selfPosts++;
    });

    const postCount = posts.length;
    const result = {
      instanceId,
      id: 'postMetrics',
      timestamp,
      source: 'reddit',
      city,
      keyword,
      postCount,
      postCount_cityMatch,
      uniqueAuthors: authors.size,
      avgTitleLength: postCount ? totalTitleLength / postCount : 0,
      totalTitleWords: totalWords,
      avgTitleWords: postCount ? totalWords / postCount : 0,
      postsWithImages,
      nsfwPosts,
      selfPosts,
      linkPosts: postCount - selfPosts
    };

    res.set('CPEE-UPDATE', 'true');
    res.status(202).send('Accepted');

    if (callback) {
      try {
        const callbackResponse = await fetch(callback, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result)
        });
        console.log(`[PostCount] Metrics sent to CPEE. Status: ${callbackResponse.status}`);
      } catch (err) {
        console.error('[PostCount] Callback error:', err.message);
      }
    }

  } catch (err) {
    console.error('[PostCount] Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export { postCountRouter };
