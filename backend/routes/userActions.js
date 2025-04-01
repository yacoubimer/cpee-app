import express from 'express';
import fetch from 'node-fetch';

const userActionsRouter = express.Router();

// Helper to get a random post by keyword
const getRandomPostByKeyword = async (keyword) => {
  const headers = { 'User-Agent': 'TUM-Reddit-Project/1.0' };
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&limit=100`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('Failed to fetch posts');
  const data = await response.json();
  const posts = data.data?.children || [];
  if (!posts.length) throw new Error('No posts found');

  const post = posts[Math.floor(Math.random() * posts.length)].data;
  return {
    fullname: post.name, // e.g., t3_abc123
    title: post.title,
    subreddit: post.subreddit,
    url: `https://www.reddit.com${post.permalink}`
  };
};

// Vote on a post (upvote/downvote)
const voteOnPost = async (req, res, direction) => {
  const { keyword } = req.body;

  if (!keyword) {
    return res.status(400).json({ error: 'keyword is required in the request body' });
  }

  const accessToken = global.redditAccessToken;
  if (!accessToken) {
    return res.status(401).json({ error: 'Missing Reddit access token' });
  }

  try {
    const { fullname, title, subreddit, url } = await getRandomPostByKeyword(keyword);

    await fetch('https://oauth.reddit.com/api/vote', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${accessToken}`,
        'User-Agent': 'TUM-Reddit-Project/1.0',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        dir: direction.toString(),
        id: fullname
      })
    });

    res.json({
      success: true,
      action: direction === 1 ? 'upvote' : 'downvote',
      title,
      subreddit,
      url,
      fullname
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Vote action failed.' });
  }
};

// Upvote and Downvote endpoints (keyword in body)
userActionsRouter.post('/upvote', (req, res) => voteOnPost(req, res, 1));
userActionsRouter.post('/downvote', (req, res) => voteOnPost(req, res, -1));

// Comment on a random post
userActionsRouter.post('/comment', async (req, res) => {
  const { keyword, text } = req.body;

  if (!keyword || !text) {
    return res.status(400).json({ error: 'keyword and text are required in the request body' });
  }

  const accessToken = global.redditAccessToken;
  if (!accessToken) {
    return res.status(401).json({ error: 'Missing Reddit access token' });
  }

  try {
    const { fullname, title, subreddit, url } = await getRandomPostByKeyword(keyword);

    await fetch('https://oauth.reddit.com/api/comment', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${accessToken}`,
        'User-Agent': 'TUM-Reddit-Project/1.0',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        api_type: 'json',
        text,
        thing_id: fullname
      })
    });

    res.json({
      success: true,
      action: 'comment',
      title,
      subreddit,
      url,
      fullname
    });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ error: 'Comment action failed.' });
  }
});

export { userActionsRouter };
