const tvmaze = require('../services/tvmazeService');
const { normalizePerson, creditsToShows } = require('../utils/showUtils');

// Fetches an actor and credits, then renders the normalized profile.
exports.getActor = async (req, res, next) => {
  try {
    const [person, credits] = await Promise.all([
      tvmaze.getPerson(req.params.id),
      tvmaze.getCastCredits(req.params.id),
    ]);
    const actor = normalizePerson(person);
    res.render('actor', { title: actor.name, actor, shows: creditsToShows(credits) });
  } catch (err) {
    next(err);
  }
};
