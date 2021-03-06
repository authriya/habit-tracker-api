require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV, CLIENT_ORIGIN } = require('./config');
const habitsRouter = require('./Habits/habits-router');
const daysRouter = require('./Days/days-router');
const habitHistoryRouter = require('./HabitHistory/habithistory-router');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(cors({
  origin: CLIENT_ORIGIN
}));
app.use(helmet());

app.use('/api/habits', habitsRouter);
app.use('/api/days', daysRouter);
app.use('/api/habithistory', habitHistoryRouter);

app.get('/', (req, res) => {
  res.send('Hello, world!')
});

app.get('/xss', (req, res) => {
  res.cookie('secretToken', '1234567890');
  res.sendFile(__dirname + '/xss-example.html');
});

  app.use(function errorHandler(error, req, res, next) {
      let response
      if (NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
      } else {
        console.error(error)
        response = { message: error.message, error }
      }
      res.status(500).json(response)
    });

module.exports = app