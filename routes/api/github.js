'use strict';
const qs = require('querystring');
const axios = require('axios');
const express = require('express');
let app = express();

const _ = {
  pick: require('lodash.pick'),
  isboolean: require('lodash.isboolean')
};

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
  // app.get('/api/github/authorize/:code', (req, res) => {
  app.get('/api/github/authorize/', (req, res) => {

    let code = req.query.code;

    authorize(code, response => {
      let result = {};
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
