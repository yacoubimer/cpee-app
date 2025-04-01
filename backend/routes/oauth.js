import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// OAuth Login Route: Returns Reddit's OAuth authorization URL as a response.
router.get('/login', (req, res) => {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.REDDIT_REDIRECT_URI);
  const scope = 'read vote submit';
  const state = 'myRandomStateString';
  const duration = 'permanent';

  const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${clientId}` +
                  `&response_type=code&state=${state}&redirect_uri=${redirectUri}` +
                  `&duration=${duration}&scope=${scope}`;

  // Return the URL in JSON so frontend can redirect the user
  res.json({ authorization_url: authUrl });
});

// OAuth Callback Route: Exchanges the code for an access token and refresh token.
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  console.log("Received code:", code, "and state:", state);

  try {
    const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.REDDIT_REDIRECT_URI
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Error from Reddit:", tokenData.error, tokenData);
      return res.status(400).send(`Error from Reddit: ${tokenData.error}`);
    }

    // Store tokens globally (not ideal for production, but okay for testing)
    global.redditAccessToken = tokenData.access_token;
    global.redditRefreshToken = tokenData.refresh_token;

    res.send(`OAuth success!<br><br>Access token: ${tokenData.access_token}<br>Refresh token: ${tokenData.refresh_token}`);
  } catch (error) {
    console.error('Error during OAuth callback:', error);
    res.status(500).send('OAuth callback error');
  }
});

export { router as oauthRouter };
