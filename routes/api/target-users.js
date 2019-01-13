'use strict';

const _ = {
  get: require('lodash.get'),
  isboolean: require('lodash.isboolean')
};

const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', { session: false });
const { ObjectID } = require('MongoDB');
const { User } = require('../../models/User');
const { Repo } = require('../../models/Repo');
const { Event } = require('../../models/Event');
const { TargetUser } = require('../../models/TargetUser');
module.exports = app => {
  // api here.
  app.get('/api/target-users', jwtAuth, (req, res) => {

    
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  });
};
