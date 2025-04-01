import express from 'express';
import fetch from 'node-fetch';
import { instanceStore } from './setRouter.js';
import { registerInstanceId } from './streampushRouter.js'; 

const locationRouter = express.Router();

const locations = [
  { city: 'Berlin', lat: 52.52, lon: 13.405, timezone: 'CET', continent: 'Europe' },
  { city: 'Munich', lat: 48.1351, lon: 11.582, timezone: 'CET', continent: 'Europe' },
  { city: 'New York', lat: 40.7128, lon: -74.006, timezone: 'EST', continent: 'North America' },
  { city: 'Tokyo', lat: 35.6762, lon: 139.6503, timezone: 'JST', continent: 'Asia' },
  { city: 'São Paulo', lat: -23.5505, lon: -46.6333, timezone: 'BRT', continent: 'South America' },
  { city: 'Paris', lat: 48.8566, lon: 2.3522, timezone: 'CET', continent: 'Europe' },
  { city: 'London', lat: 51.5074, lon: -0.1278, timezone: 'GMT', continent: 'Europe' },
  { city: 'Cairo', lat: 30.0444, lon: 31.2357, timezone: 'EET', continent: 'Africa' },
  { city: 'Toronto', lat: 43.65107, lon: -79.347015, timezone: 'EST', continent: 'North America' },
  { city: 'Sydney', lat: -33.8688, lon: 151.2093, timezone: 'AEST', continent: 'Australia' }
];

locationRouter.get('/location', async (req, res) => {
  const instanceId = req.query.instanceId;
  const callbackUrl = req.headers['cpee-callback'];
  const activity = req.headers['cpee-activity'];
  const instance = req.headers['cpee-instance'];

  registerInstanceId(instanceId); 

  const location = locations[Math.floor(Math.random() * locations.length)];
  const timestamp = new Date().toISOString();
  const temperature = (Math.random() * 35).toFixed(2);
  const humidity = (Math.random() * 100).toFixed(1);

  const result = {
    instanceId,
    activity,
    instance,
    source: 'location',
    city: location.city,
    latitude: location.lat,
    longitude: location.lon,
    timezone: location.timezone,
    continent: location.continent,
    temperature: `${temperature} °C`,
    humidity: `${humidity} %`,
    timestamp,
    id: 'locationMetrics' 
  };

  console.log(`[Sensor] Assigned ${location.city} to instance ${instanceId}`);
  console.log('[Result]:', result);

  res.set('CPEE-CALLBACK', 'true');
  res.status(202).send('Accepted');

  // Save to memory for use in other steps
  instanceStore[instanceId] = {
    instanceId,
    keyword: location.city,
    city: location.city
  };

  if (callbackUrl) {
    try {
      const response = await fetch(callbackUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });

      console.log(`Callback sent to CPEE with status ${response.status}`);
    } catch (err) {
      console.error('Error sending callback to CPEE:', err.message);
    }
  } else {
    console.warn('Missing CPEE callback URL');
  }
});

export { locationRouter };
