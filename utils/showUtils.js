const GENRES = [
  'Action', 'Adventure', 'Anime', 'Comedy', 'Crime', 'Drama', 'Family', 'Fantasy',
  'Horror', 'Mystery', 'Romance', 'Science-Fiction', 'Thriller', 'War',
];
const STATUSES = ['Running', 'Ended', 'To Be Determined'];
const SORTS = { rating: 'Highest rating', premiere: 'Newest premiere', name: 'Title A–Z' };

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function imageUrl(image, size = 'medium') {
  const url = image && (image[size] || image.medium || image.original);
  return url ? url.replace(/^http:/, 'https:') : '/img/placeholder.svg';
}

function truncate(text, max = 140) {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

function formatDate(iso) {
  if (!iso) return 'TBA';
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return 'TBA';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function normalizeShow(s) {
  return {
    id: s.id,
    name: s.name,
    image: imageUrl(s.image, 'medium'),
    poster: imageUrl(s.image, 'original'),
    rating: s.rating && typeof s.rating.average === 'number' ? s.rating.average : null,
    genres: s.genres || [],
    status: s.status || 'Unknown',
    premiered: s.premiered || null,
    ended: s.ended || null,
    year: s.premiered ? s.premiered.slice(0, 4) : '—',
    runtime: s.runtime || s.averageRuntime || null,
    language: s.language || '—',
    network: (s.network && s.network.name) || (s.webChannel && s.webChannel.name) || '—',
    officialSite: s.officialSite || null,
    summary: stripHtml(s.summary) || 'No description available.',
  };
}

function processShows(rawShows, { genre = '', status = '', sort = 'rating' } = {}) {
  let shows = rawShows.map(normalizeShow);
  if (genre) shows = shows.filter((s) => s.genres.includes(genre));
  if (status) shows = shows.filter((s) => s.status === status);

  const byRating = (a, b) => (b.rating ?? -1) - (a.rating ?? -1);
  const sorters = {
    rating: byRating,
    premiere: (a, b) => (b.premiered || '').localeCompare(a.premiered || ''),
    name: (a, b) => a.name.localeCompare(b.name),
  };
  return shows.sort(sorters[sort] || byRating);
}

function readFilters(src = {}) {
  return {
    genre: GENRES.includes(src.genre) ? src.genre : '',
    status: STATUSES.includes(src.status) ? src.status : '',
    sort: Object.keys(SORTS).includes(src.sort) ? src.sort : 'rating',
  };
}

function groupBySeason(episodes) {
  const map = new Map();
  for (const ep of episodes) {
    if (!map.has(ep.season)) map.set(ep.season, []);
    map.get(ep.season).push({
      id: ep.id,
      number: ep.number,
      name: ep.name,
      airdate: formatDate(ep.airdate),
      runtime: ep.runtime || null,
      rating: ep.rating && typeof ep.rating.average === 'number' ? ep.rating.average : null,
      summary: truncate(stripHtml(ep.summary), 220),
    });
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([season, eps]) => {
      const rated = eps.filter((e) => e.rating !== null);
      const avg = rated.length ? rated.reduce((sum, e) => sum + e.rating, 0) / rated.length : null;
      return { season, count: eps.length, avgRating: avg, episodes: eps };
    });
}

function uniqueCast(cast, limit = 40) {
  const seen = new Set();
  const out = [];
  for (const { person, character } of cast) {
    if (seen.has(person.id)) continue;
    seen.add(person.id);
    out.push({
      id: person.id,
      name: person.name,
      image: imageUrl(person.image, 'medium'),
      character: character ? character.name : '—',
    });
    if (out.length >= limit) break;
  }
  return out;
}

function ageFrom(birthday, deathday) {
  if (!birthday) return null;
  const b = new Date(birthday), end = deathday ? new Date(deathday) : new Date();
  if (Number.isNaN(b.getTime())) return null;
  let age = end.getUTCFullYear() - b.getUTCFullYear();
  const beforeBirthday = end.getUTCMonth() < b.getUTCMonth() ||
    (end.getUTCMonth() === b.getUTCMonth() && end.getUTCDate() < b.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function normalizePerson(p) {
  return {
    id: p.id,
    name: p.name,
    image: imageUrl(p.image, 'medium'),
    birthday: formatDate(p.birthday),
    deathday: p.deathday ? formatDate(p.deathday) : null,
    age: ageFrom(p.birthday, p.deathday),
    country: (p.country && p.country.name) || '—',
    gender: p.gender || '—',
  };
}

function creditsToShows(credits) {
  const seen = new Set();
  const shows = [];
  for (const c of credits) {
    const show = c._embedded && c._embedded.show;
    if (!show || seen.has(show.id)) continue;
    seen.add(show.id);
    shows.push(normalizeShow(show));
  }
  return shows.sort((a, b) => (b.premiered || '').localeCompare(a.premiered || ''));
}

module.exports = {
  GENRES, STATUSES, SORTS, stripHtml, imageUrl, truncate, formatDate, normalizeShow,
  processShows, readFilters, groupBySeason, uniqueCast, normalizePerson, creditsToShows,
};
