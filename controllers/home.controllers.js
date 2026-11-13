// Renders the home page with the search form
exports.getHome = (req, res) => {
  res.render('index', { title: 'ShowHub' });
};