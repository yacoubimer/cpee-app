import express from 'express';
import fetch from 'node-fetch';
import { instanceStore } from './setRouter.js';
import { registerInstanceId } from './streampushRouter.js'; 

const engagementRouter = express.Router();

engagementRouter.get('/engagement', async (req, res) => {
  const instanceId = req.query.instanceId;
  const callbackUrl = req.headers['cpee-callback'];
  const keywordFromQuery = req.query.keyword;

  if (!instanceId) {
    console.warn('Missing instanceId');
    return res.status(400).json({ error: 'Missing instanceId in query' });
  }

  registerInstanceId(instanceId); // register this instance as active for SSE

  const instance = instanceStore[instanceId];
  const keyword = keywordFromQuery || instance?.keyword;

  if (!instance || !keyword) {
    console.warn(`No keyword found for instance ${instanceId}`);
    return res.status(404).json({ error: `No keyword found for instanceId: ${instanceId}` });
  }

  // Respond to CPEE immediately
  res.set('CPEE-UPDATE', 'true');
  res.status(202).send('Accepted');

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
        console.error('Reddit fetch failed with status:', response.status);
        break;
      }

      const data = await response.json();
      const newPosts = data.data?.children || [];

      if (!newPosts.length) break;

      posts.push(...newPosts);
      after = data.data.after;
      if (!after) break;
    }

    const timestamp = new Date().toISOString();

    let totalScore = 0, totalComments = 0, maxScore = 0, minScore = Infinity;
    const scores = [], upvotes = [], awards = [];

    posts.forEach(post => {
      const p = post.data;
      const score = p.score || 0;
      const comments = p.num_comments || 0;
      const upvote_ratio = p.upvote_ratio || 0;

      totalScore += score;
      totalComments += comments;
      scores.push(score);
      upvotes.push(upvote_ratio);
      awards.push(p.total_awards_received || 0);

      if (score > maxScore) maxScore = score;
      if (score < minScore) minScore = score;
    });

    const postCount = posts.length;
    const avgScore = postCount ? totalScore / postCount : 0;
    const avgComments = postCount ? totalComments / postCount : 0;
    const scoreStdDev = scores.length
      ? Math.sqrt(scores.reduce((acc, val) => acc + Math.pow(val - avgScore, 2), 0) / scores.length)
      : 0;

    const sortedScores = [...scores].sort((a, b) => a - b);
    const mid = Math.floor(sortedScores.length / 2);
    const medianScore = sortedScores.length % 2 === 0
      ? (sortedScores[mid - 1] + sortedScores[mid]) / 2
      : sortedScores[mid];

    const scoreRange = maxScore - (minScore === Infinity ? 0 : minScore);
    const postsWithComments = posts.filter(p => p.data.num_comments > 0).length;
    const commentRatio = postCount ? (postsWithComments / postCount) * 100 : 0;
    const topScores = [...scores].sort((a, b) => b - a).slice(0, 5);

    const result = {
      instanceId,
      id: 'engagementMetrics',
      timestamp,
      source: 'reddit',
      city: instance.city,
      keyword,
      postCount,
      totalScore,
      totalComments,
      avgScore,
      avgComments,
      maxScore,
      minScore: minScore === Infinity ? 0 : minScore,
      scoreStdDev,
      medianScore,
      scoreRange,
      commentRatio,
      topScores,
      topUpvotes: [...upvotes].sort((a, b) => b - a).slice(0, 5),
      avgUpvoteRatio: upvotes.length ? upvotes.reduce((a, b) => a + b, 0) / upvotes.length : 0,
      totalAwards: awards.reduce((a, b) => a + b, 0)
    };

    if (callbackUrl) {
      const response = await fetch(callbackUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });


    } else {
      console.warn('No CPEE callback URL provided.');
    }

  } catch (err) {
    console.error('Error during engagement processing:', err.message);
  }
});

export { engagementRouter };
