const { readFilters, GENRES, SORTS } = require('../utils/showUtils');

// Checks the title length and content, then attaches normalized search filters.
module.exports = function validateSearch(req, res, next) {
  const src = req.method === 'POST' ? req.body || {} : req.query;
  const q = typeof src.q === 'string' ? src.q.trim().replace(/\s+/g, ' ') : '';

  let error = null;
  if (!q) error = 'Please enter a show title.';
  else if (q.length < 2) error = 'The title must be at least 2 characters long.';
  else if (q.length > 100) error = 'The title must be at most 100 characters long.';
  else if (!/[\p{L}\p{N}]/u.test(q)) error = 'The title must contain letters or numbers.';

  req.searchInput = { q, ...readFilters(src) };

  if (error) {
    return res.status(400).render('index', {
      title: 'ShowHub',
      error,
      query: q.slice(0, 100),
      filters: req.searchInput,
      genres: GENRES,
      sorts: SORTS,
      shows: [],
      heading: null,
      pagination: null,
    });
  }
  next();
};
