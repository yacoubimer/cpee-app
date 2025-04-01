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
node app-mock.js
```

#### Frontend

If you're testing locally:
```bash
npm run dev
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
https://lehre.bpm.in.tum.de/ports/3036/
```

```

Visualizes:
- Engagement metrics (score, comments, trends)
- Post metrics (total posts, city match, types)
- Location sensor data (city, coordinates, temperature)


