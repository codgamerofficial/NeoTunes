require('dotenv').config();
const youtube = require('./services/youtube');
const jamendo = require('./services/jamendo');
const spotify = require('./services/spotify');

async function check() {
  const query = 'Believer Imagine Dragons';
  const envVars = {
    YOUTUBE_API_KEY: !!process.env.YOUTUBE_API_KEY,
    JAMENDO_CLIENT_ID: !!process.env.JAMENDO_CLIENT_ID,
    SPOTIFY_CLIENT_ID: !!process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: !!process.env.SPOTIFY_CLIENT_SECRET
  };
  console.log('Env Vars:', JSON.stringify(envVars));

  const providers = [
    { name: 'Youtube', service: youtube },
    { name: 'Jamendo', service: jamendo },
    { name: 'Spotify', service: spotify }
  ];

  for (const p of providers) {
    try {
      const results = await p.service.search(query, 3);
      console.log(\\ results: \\);
    } catch (err) {
      console.log(\\ error: \\);
    }
  }
}

check();
