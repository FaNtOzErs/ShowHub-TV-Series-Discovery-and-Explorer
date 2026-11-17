const tvmaze = require('../services/tvmazeService');
const { GENRES, STATUSES, SORTS, processShows, readFilters } = require('../utils/showUtils');

const PAGE_SIZE = 24;

exports.getHome = async (req, res, next) => {
  try {
    const filters = readFilters(req.query);
    const page = Math.min(Math.max(parseInt(req.query.page, 10) || 0, 0), 300);

    const raw = await tvmaze.getShowIndex(page);
    const shows = processShows(raw, filters).slice(0, PAGE_SIZE);

    const link = (p) => '/?' + new URLSearchParams({ ...filters, page: p }).toString();
    const pagination = { page, prev: page > 0 ? link(page - 1) : null, next: raw.length ? link(page + 1) : null };

    res.render('index', {
      title: 'ShowHub – TV series explorer',
      error: null, query: '', filters, genres: GENRES, statuses: STATUSES, sorts: SORTS,
      shows, pagination,
      heading: filters.genre ? `${filters.genre} shows` : 'Popular shows',
    });
  } catch (err) {
    next(err);
  }
};

exports.postSearch = (req, res) => {
  const { q, genre, sort } = req.searchInput;
  res.redirect(303, '/search?' + new URLSearchParams({ q, genre, sort }).toString());
};

exports.getSearch = async (req, res, next) => {
  try {
    const { q, genre, status, sort } = req.searchInput;
    const found = await tvmaze.searchShows(q);
    const shows = processShows(found, { genre, status, sort });

    res.render('results', {
      title: `Results for "${q}"`,
      q, filters: { genre, status, sort }, genres: GENRES, sorts: SORTS,
      shows, total: found.length,
    });
  } catch (err) {
    next(err);
  }
};
