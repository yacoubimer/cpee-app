## Reddit-CPEE Integration Project

### Environment Variables (Backend)
Create a `.env` file in `/backend` with:
```env
# Reddit OAuth App Info
REDDIT_CLIENT_ID=02T48VMblCacQwJx6RfCJw
REDDIT_CLIENT_SECRET=cQIAcdgN9X8oDfjuWucOM_DHEICLag

# Your Reddit App Name 
REDDIT_APP_NAME=Meriem_Prak

# Reddit Redirect URI
REDDIT_REDIRECT_URI=https://lehre.bpm.in.tum.de/ports/3036/reddit/oauth/callback
```

---

### Running the App

First, clone or navigate to your project folder:
```bash
cd Reddit-CPEE-Integration-Project
```

#### Backend
```bash
cd reddit/backend
node index.js
```

Or if you're running the mock backend:
```bash
cd reddit/backend
node app-mock.js
```

#### Frontend
```bash
cd ../frontend
npm install
npm start    # For Create React App (CRA)
```

If you're using Vite instead:
```bash
npm run dev -- --host
```

---

### Reddit Authorization

1. In your CPEE process, find the `authorizationUrl` provided in the process model.
2. Open that URL in your browser to log in and authorize the app.
3. On success, the access token is stored and ready to use.

Reddit login is only required for actions like comment, upvote, and downvote.
Data fetching (like metrics and sensors) works without login via Reddit's public API.

---

### CPEE Integration

- Data is fetched from Reddit on `/postCount` and `/engagement`
- Results are streamed via Server-Sent Events (SSE) to both frontend and CPEE
- `/` receives incoming pushes from CPEE and forwards relevant data

---

### Dashboard

Visit the dashboard:
```
http://localhost:5173
```

```

Visualizes:
- Engagement metrics (score, comments, trends)
- Post metrics (total posts, city match, types)
- Location sensor data (city, coordinates, temperature)

---

### Test Mode & Mock Data

When live data is not available or slow to arrive, a fallback **mock stream** can be used by switching to **Test Mode** via the dashboard toggle. 
This mode simulates Reddit data in real time using SSE and allows testing all visual components without a running CPEE instance.

To run with mock data:
1. Run `app-mock.js` in backend
2. Start frontend (`npm start`)
3. Visit the dashboard and click "Switch to Test Mode"

---

### Known Development Note

The dashboard was tested locally using mock data due to  issues serving the frontend build in the deployment environment. 
All visualizations and stream logic remain fully compatible with real runtime data from CPEE 

