function notFound(req, res) {
  res.status(404).render('404', { title: 'Page not found', path: req.originalUrl });
}

function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.stack || err);

  if (res.headersSent) return next(err);

  let status = Number(err.status || err.statusCode) || 500;
  if (status < 400 || status > 599) status = 500;
  let message = 'Something went wrong on our side. Please try again later.';

  if (err.name === 'ApiError') message = err.userMessage;
  else if (err.type === 'entity.parse.failed') message = 'The data you sent could not be read.';
  else if (status === 400) message = 'The request was not valid.';
  else if (status === 413) message = 'The request was too large.';

  const titles = { 400: 'Bad request', 404: 'Not found', 429: 'Too many requests', 502: 'Service problem', 503: 'Service unavailable', 504: 'Timeout' };
  res.status(status).render('error', { title: 'Error', status, heading: titles[status] || 'Something went wrong', message });
}

module.exports = { notFound, errorHandler };
