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
module.exports = app => {
  // api here.
  app.post('/api/target-user', jwtAuth, (req, res) => {
    const userID = req.user._id;
    const { id, login, avatar_url, html_url, events_url, url } = req.body;

    User.findById(userID).then(user => {
      if (!user._id.equals(userID)) {
        return res.status(422).send({ error: 'Record already exists' });
      }
      TargetUser.findOne({ github_id: id })
        .then(targetUser => {
          console.log('targetUser: ', targetUser);
          if (targetUser) {
            return res.status(400).json({ error: 'Record already exists' });
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
            .then(targetUser => res.send(targetUser))
            .catch(err => {
              res.status(400).send({ err });
            });
        })
        .catch(err => {
          res.status(400).send({ err });
        });
    });
  });
};

// app.get('/api/target-user', jwtAuth, (req, res) => {
//   res.json({
//     req
//   });
// })
