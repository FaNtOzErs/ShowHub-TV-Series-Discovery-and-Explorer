const axios = require('axios');

// One configured Axios instance for all TVmaze requests
const api = axios.create({
  baseURL: process.env.API_BASE_URL || 'https://api.tvmaze.com',
  timeout: 8000,
});

// Search shows by title; the API wraps each result as { score, show }
async function searchShows(query) {
  const { data } = await api.get('/search/shows', { params: { q: query } });
  return data.map((item) => item.show);
}

module.exports = { searchShows };