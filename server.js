'use strict';
if (process.env.NODE_ENV === 'development') require('dotenv').config();
require('./config/config');

const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');
const morgan = require('morgan');
const jsonValidator = require('./middleware/jsonValidator');
const cors = require('cors');
let server;
const app = express();
const port = process.env.PORT || 3000;

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.use(jsonValidator);
app.use(express.static('public'));

require('./config/passport')(passport);
require('./routes/api/users')(app);
require('./routes/api/github')(app);
require('./routes/api/target-users')(app);

function runServer() {
  const port = process.env.PORT || 3000;
  return new Promise((resolve, reject) => {
    mongoose.connect(
      process.env.DATABASE_URI,
      { useNewUrlParser: true },
      err => {
        if (err) {
          return reject(err);
        }
        server = app
          .listen(port, () => {
            console.log(
              '\n',
              `🏆  Your app is now running on port ${port} 🚀`,
              '\n'
              // 'Connecting to: \n\t', process.env.DATABASE_URI, '\n'
            );
            resolve();
          })
          .on('error', err => {
            mongoose.disconnect();
            reject(err);
          });
      }
    );
  });
}

function closeServer() {
  return new Promise((resolve, reject) => {
    console.log('Closing server');
    server.close(err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
