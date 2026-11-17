const express = require('express');
const home = require('../controllers/homeController');
const show = require('../controllers/showController');
const actor = require('../controllers/actorController');
const validateSearch = require('../middleware/validateSearch');

const router = express.Router();

router.param('id', (req, res, next, value) => {
  if (!/^[1-9]\d{0,8}$/.test(value)) return next('router');
  next();
});

router.get('/', home.getHome);
router.post('/search', validateSearch, home.postSearch);
router.get('/search', validateSearch, home.getSearch);

router.get('/show/:id', show.getShow);
router.get('/show/:id/episodes', show.getEpisodes);
router.get('/show/:id/cast', show.getCast);
router.get('/actor/:id', actor.getActor);

module.exports = router;
