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

app.use(requestLogger);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));

app.use('/', routes);

app.use(notFound);
app.use(errorHandler);

process.on('unhandledRejection', (reason) => console.error('[unhandledRejection]', reason));
process.on('uncaughtException', (err) => console.error('[uncaughtException]', err));

if (require.main === module) {
  app.listen(PORT, () => console.log(`ShowHub running on http://localhost:${PORT}`));
}

module.exports = app;
