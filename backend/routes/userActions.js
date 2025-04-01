import express from 'express';
import fetch from 'node-fetch';
import { instanceStore } from './setRouter.js';

const userActionsRouter = express.Router();

// Helper to get random post by keyword
const getRandomPostByKeyword = async (keyword) => {
  const headers = { 'User-Agent': 'TUM-Reddit-Project/1.0' };
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(keyword)}&limit=100`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('Failed to fetch posts');
  const data = await response.json();
  const posts = data.data?.children || [];
  if (!posts.length) throw new Error('No posts found');
  return posts[Math.floor(Math.random() * posts.length)].data.name; // fullname (e.g., t3_xyz)
};

// Vote on a post (upvote/downvote)
const voteOnPost = async (req, res, direction) => {
  const { instanceId, keyword } = req.query;

  if (!instanceId || !keyword) {
    return res.status(400).json({ error: 'instanceId and keyword are required as query params' });
  }

  const instance = instanceStore[instanceId];
  if (!instance) {
    return res.status(404).json({ error: 'Instance not found' });
  }

  const accessToken = global.redditAccessToken;
  if (!accessToken) {
    return res.status(401).json({ error: 'Missing Reddit access token' });
  }

  try {
    const postFullname = await getRandomPostByKeyword(keyword);

    const voteResponse = await fetch('https://oauth.reddit.com/api/vote', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${accessToken}`,
        'User-Agent': 'TUM-Reddit-Project/1.0',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        dir: direction.toString(),
        id: postFullname
      })
    });

    const voteData = await voteResponse.json();

    res.json({
      success: true,
      action: direction === 1 ? 'upvote' : 'downvote',
      instanceId,
      postId: postFullname,
      data: voteData
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Vote action failed.' });
  }
};

// Upvote and Downvote endpoints
userActionsRouter.post('/upvote', (req, res) => voteOnPost(req, res, 1));
userActionsRouter.post('/downvote', (req, res) => voteOnPost(req, res, -1));

// Comment on a random post
userActionsRouter.post('/comment', async (req, res) => {
  const { instanceId, keyword, text } = req.body;

  if (!instanceId || !keyword || !text) {
    return res.status(400).json({ error: 'instanceId, keyword, and text are required' });
  }

  const instance = instanceStore[instanceId];
  if (!instance) {
    return res.status(404).json({ error: 'Instance not found' });
  }

  const accessToken = global.redditAccessToken;
  if (!accessToken) {
    return res.status(401).json({ error: 'Missing Reddit access token' });
  }

  try {
    const postFullname = await getRandomPostByKeyword(keyword);

    const commentResponse = await fetch('https://oauth.reddit.com/api/comment', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${accessToken}`,
        'User-Agent': 'TUM-Reddit-Project/1.0',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        api_type: 'json',
        text,
        thing_id: postFullname
      })
    });

    const commentData = await commentResponse.json();

    res.json({
      success: true,
      action: 'comment',
      instanceId,
      postId: postFullname,
      data: commentData
    });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ error: 'Comment action failed.' });
  }
});

export { userActionsRouter };
