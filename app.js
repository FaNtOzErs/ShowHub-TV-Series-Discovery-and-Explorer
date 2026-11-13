require('dotenv').config();
const express = require('express');
const path = require('path');
const homeRoutes = require('./routes/home');

const app = express();
const PORT = process.env.PORT || 3080;

// EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Built-in middleware: static files and form/JSON parsing
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', homeRoutes);

app.listen(PORT, () => console.log(`ShowHub running on http://localhost:${PORT}`));