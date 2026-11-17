const tvmaze = require('../services/tvmazeService');
const { normalizeShow, groupBySeason, uniqueCast } = require('../utils/showUtils');

exports.getShow = async (req, res, next) => {
  try {
    const show = normalizeShow(await tvmaze.getShow(req.params.id));
    res.render('show', { title: show.name, show, tab: 'overview' });
  } catch (err) {
    next(err);
  }
};

exports.getEpisodes = async (req, res, next) => {
  try {
    const [rawShow, episodes] = await Promise.all([
      tvmaze.getShow(req.params.id),
      tvmaze.getEpisodes(req.params.id),
    ]);
    const show = normalizeShow(rawShow);
    const seasons = groupBySeason(episodes);
    res.render('episodes', {
      title: `${show.name} – episodes`, show, seasons, tab: 'episodes',
      totalEpisodes: episodes.length,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCast = async (req, res, next) => {
  try {
    const [rawShow, rawCast] = await Promise.all([
      tvmaze.getShow(req.params.id),
      tvmaze.getCast(req.params.id),
    ]);
    const show = normalizeShow(rawShow);
    res.render('cast', { title: `${show.name} – cast`, show, cast: uniqueCast(rawCast), tab: 'cast' });
  } catch (err) {
    next(err);
  }
};
