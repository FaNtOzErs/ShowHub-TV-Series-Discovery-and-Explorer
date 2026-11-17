const express = require('express');
const home = require('../controllers/homeController');
const show = require('../controllers/showController');
const actor = require('../controllers/actorController');
const validateSearch = require('../middleware/validateSearch');

const router = express.Router();

// Allow only numeric IDs; next('router') skips these routes and reaches the 404 handler.
router.param('id', (req, res, next, value) => {
  if (!/^[1-9]\d{0,8}$/.test(value)) return next('router');
  next();
});

// Render the home page with the show index.
router.get('/', home.getHome);
// Validate a submitted search before redirecting to its GET results URL.
router.post('/search', validateSearch, home.postSearch);
// Validate the search query and render matching shows.
router.get('/search', validateSearch, home.getSearch);

// Render one show's overview.
router.get('/show/:id', show.getShow);
// Render the show's episodes grouped by season.
router.get('/show/:id/episodes', show.getEpisodes);
// Render the show's cast.
router.get('/show/:id/cast', show.getCast);
// Render an actor's profile and show credits.
router.get('/actor/:id', actor.getActor);

module.exports = router;
