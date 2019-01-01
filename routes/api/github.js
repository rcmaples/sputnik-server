'use strict';
const qs = require('querystring');
const axios = require('axios');
const express = require('express');
const passport = require('passport');
let app = express();

const _ = {
  pick: require('lodash.pick'),
  isboolean: require('lodash.isboolean')
};

let GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET;

if (process.env.NODE_ENV === 'development') {
  GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID_DEV;
  GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET_DEV;
} else {
  GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
}

const authorize = (code, callback) => {
  let data = {
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
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
      // response.data.access_token
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

module.exports = app => {
  let result = {};
  app.get(
    '/api/github/authorize/:code',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      let code = req.params.code;
      authorize(code, response => {
        console.log(`response data: `, response.data);
        let {
          access_token,
          error,
          error_description,
          error_uri
        } = response.data;
        if (!access_token) {
          result = {
            error: error || 'bad_code',
            error_description: error_description || 'Bad code.',
            error_uri: error_uri
          };
          res.status(400).json(result);
        } else {
          result = { access_token: access_token };
          res.status(200).json(result);
        }
      });
    }
  );
};
