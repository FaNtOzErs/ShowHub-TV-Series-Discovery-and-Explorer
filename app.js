require('dotenv').config();
const express = require('express');
const path = require('path');

const routes = require('./routes');
const requestLogger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const helpers = require('./utils/showUtils');

const app = express();
const PORT = process.env.PORT || 3090;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.locals.fmt = helpers;

// Log every request before another middleware or route can handle it.
app.use(requestLogger);
// Serve static assets before checking application routes.
app.use(express.static(path.join(__dirname, 'public')));
// Parse form bodies before routes read submitted search values.
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
// Parse JSON bodies before routes read JSON requests.
app.use(express.json({ limit: '10kb' }));

// Let the application routes handle requests before the fallback handlers.
app.use('/', routes);

// Handle unmatched paths only after every route has had a chance to match.
app.use(notFound);
// Express error middleware must come last and accept four arguments.
app.use(errorHandler);

process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));

if (require.main === module) {
  app.listen(PORT, () => console.log(`ShowHub running on http://localhost:${PORT}`));
}

module.exports = app;
