'use strict';

const _ = {
  get: require('lodash.get'),
  isboolean: require('lodash.isboolean')
};

const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', { session: false });
// const { ObjectID } = require('MongoDB');
const User = require('../../models/User');
const Repo = require('../../models/Repo');
const Event = require('../../models/Event');
const TargetUser = require('../../models/TargetUser');
const setAuthToken = require('../../utils/setAuthToken');
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const saveUser = (userID, id, login, avatar_url, html_url, events_url, url) => {
  User.findById(userID).then(user => {
    if (!user._id.equals(userID)) {
      throw new Error('Record sdfsdf exists');
    }
    TargetUser.findOne({ github_id: id })
      .then(targetUser => {
        if (targetUser) {
          return new Error('whoops');
        }
        const newTargetUser = new TargetUser({
          github_id: id,
          login: login,
          avatar_url: avatar_url,
          html_url: html_url,
          events_url: events_url,
          url: url,
          events_list: []
        });
        newTargetUser
          .save()
          .then(targetUser => targetUser.serialize())
          .catch(err => {
            console.log('IM DEAD HERE');
            throw new Error(err);
          });
      })
      .catch(err => {
        console.log('I DIE HERE');
        next(err);
      });

    // console.log('This works!');
  });
};

module.exports = app => {
  // api here.
  app.post(
    '/api/target-user',
    jwtAuth,
    asyncMiddleware(async (req, res, next) => {
      try {
        const userID = req.user._id;
        const gitHubToken = req.user.github_access_token;
        // console.log(req.user);
        setAuthToken(gitHubToken);
        const { id, login, avatar_url, html_url, events_url, url } = req.body;
        const user = await saveUser(
          userID,
          id,
          login,
          avatar_url,
          html_url,
          events_url,
          url,
          next
        );
        res.json(user);
      } catch (error) {
        next(error);
      }
    })
  );
};
