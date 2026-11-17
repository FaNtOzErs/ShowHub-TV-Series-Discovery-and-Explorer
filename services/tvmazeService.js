const axios = require('axios');

const api = axios.create({
  baseURL: process.env.API_BASE_URL || 'https://api.tvmaze.com',
  timeout: 8000,
  headers: { Accept: 'application/json' },
});

class ApiError extends Error {
  constructor(status, userMessage, cause) {
    super(userMessage);
    this.name = 'ApiError';
    this.status = status;
    this.userMessage = userMessage;
    this.cause = cause;
  }
}

// Converts Axios errors into ApiErrors with messages safe to show users.
function toApiError(err, what) {
  if (err.response) {
    const s = err.response.status;
    if (s === 404) return new ApiError(404, `${what} could not be found.`, err);
    if (s === 429) {
      return new ApiError(429, 'TVmaze received too many requests. Please wait a few seconds and try again.', err);
    }
    if (s >= 500) return new ApiError(502, 'TVmaze is having problems right now. Please try again later.', err);
    return new ApiError(502, 'TVmaze returned an unexpected response.', err);
  }
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    return new ApiError(504, 'TVmaze took too long to answer. Please try again.', err);
  }
  return new ApiError(503, 'Could not reach TVmaze. Check your internet connection and try again.', err);
}

// Keep successful responses for five minutes to avoid unnecessary TVmaze requests.
const cache = new Map();
const TTL_MS = 5 * 60 * 1000;

async function get(url, what, params) {
  const key = url + JSON.stringify(params || {});
  const hit = cache.get(key);
  if (hit && Date.now() - hit.time < TTL_MS) return hit.data;

  try {
    const { data } = await api.get(url, { params });
    if (cache.size > 200) cache.clear();
    cache.set(key, { data, time: Date.now() });
    return data;
  } catch (err) {
    console.error(`[TVmaze] GET ${url} failed:`, err.code || '', err.response?.status || '', err.message);
    throw toApiError(err, what);
  }
}

async function searchShows(query) {
  const data = await get('/search/shows', 'The search', { q: query });
  return data.map((item) => item.show);
}

async function getShowIndex(page = 0) {
  try {
    return await get('/shows', 'This page', { page });
  } catch (err) {
    if (err.status === 404) return []; // page number beyond the last page = empty list
    throw err;
  }
}

const getShow = (id) => get(`/shows/${id}`, 'This show');

const getEpisodes = (id) => get(`/shows/${id}/episodes`, 'The episode list');

const getCast = (id) => get(`/shows/${id}/cast`, 'The cast');

const getPerson = (id) => get(`/people/${id}`, 'This person');

const getCastCredits = (id) => get(`/people/${id}/castcredits`, 'The credits', { embed: 'show' });

module.exports = {
  ApiError, searchShows, getShowIndex, getShow, getEpisodes, getCast, getPerson, getCastCredits,
};
