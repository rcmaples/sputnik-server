'use strict';
const qs = require('querystring');
const axios = require('axios');
const express = require('express');
let app = express();

const _ = {
  pick: require('lodash.pick'),
  isboolean: require('lodash.isboolean')
};

const TRUNCATE_THRESHOLD = 10,
  REVEALED_CHARS = 3,
  REPLACEMENT = '***';

const authorize = (code, callback) => {
  let data = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code: code
  };

  return axios
    .post(`https://github.com/login/oauth/access_token`, data, {
      headers: {
        'content-length': JSON.stringify(data).length,
        Accept: 'application/json'
      }
    })
    .then(response => {
      // console.log('axios response: \n\t', response.data);
      callback(response);
    })
    .catch(err => {
      callback(err);
    });
};

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

/**
 * Handles logging to the console.
 * Logged values can be sanitized before they are logged
 *
 * @param {string} label - label for the log message
 * @param {Object||string} value - the actual log message, can be a string or a plain object
 * @param {boolean} sanitized - should the value be sanitized before logging?
 */
function log(label, value, sanitized) {
  value = value || '';
  if (sanitized) {
    if (typeof value === 'string' && value.length > TRUNCATE_THRESHOLD) {
      console.log(label, value.substring(REVEALED_CHARS, 0) + REPLACEMENT);
    } else {
      console.log(label, REPLACEMENT);
    }
  } else {
    console.log(label, value);
  }
}

module.exports = app => {
  app.get('/api/github/authorize/:code', (req, res) => {
    let code = req.params.code;
    log('authenticating code: ', code, false);
    authorize(code, response => {
      let result = {};
      console.log(response.data);
      let { access_token, error, error_description } = response.data;
      if (!access_token) {
        result = {
          error: error || 'bad_code',
          error_description: error_description || 'Bad code.'
        };
      } else {
        result = { access_token: access_token };
      }
      res.json(result);
    });
  });
};
