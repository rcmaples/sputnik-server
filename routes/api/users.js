'use strict';
// const express = require('express');
// const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = {
  get: require('lodash.get'),
  isboolean: require('lodash.isboolean')
};
const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', { session: false });
const { ObjectID } = require('MongoDB');

// Load input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load models
const User = require('../../models/User');
const { Repo } = require('../../models/Repo');
const { Event } = require('../../models/Event');
const { TargetUser } = require('../../models/TargetUser');

module.exports = app => {
  app.post('/api/users/register', (req, res) => {
    // Form validation

    const { errors, isValid } = validateRegisterInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        return res.status(400).json({ email: 'Email already exists' });
      } else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        });

        // Hash password before saving in database
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          });
        });
      }
    });
  });

  app.post('/api/users/login', (req, res) => {
    // Form validation

    const { errors, isValid } = validateLoginInput(req.body);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    User.findOne({ email }).then(user => {
      // Check if user exists
      if (!user) {
        return res.status(404).json({ emailnotfound: 'Email not found' });
      }

      let github_access_token = user.github_access_token;

      // Check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // User matched
          // Create JWT Payload
          const payload = {
            id: user.id,
            name: user.name
          };

          // Sign token
          jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
              expiresIn: 31556926 // 1 year in seconds
            },
            (err, token) => {
              res.json({
                success: true,
                token: 'Bearer ' + token,
                github_access_token: github_access_token
              });
            }
          );
        } else {
          return res
            .status(400)
            .json({ passwordincorrect: 'Password incorrect' });
        }
      });
    });
  });

  app.get('/api/users/currentuser', jwtAuth, (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  });

  app.patch('/api/users/token', jwtAuth, (req, res) => {
    const token = _.get(req.body, ['github_access_token']);
    const userID = req.user.id;
    // console.log(userID);
    User.findById(userID)
      .then(user => {
        // console.log(user);
        if (user._id != userID) {
          return res.status(422).send('Unauthorized');
        }

        User.findByIdAndUpdate(
          userID,
          {
            $set: { github_access_token: token }
          },
          { new: true }
        )
          .then(user => {
            if (!user) {
              return res.status(404).send('User not found');
            }
            return res.status(200).send(user.serialize());
          })
          .catch(err => {
            res.status(400).send({ err });
          });
      })
      .catch(err => {
        res.status(400).send({ err });
      });
    // console.log(token);
  });

  app.patch('/api/users/urls', jwtAuth, (req, res) => {
    const userID = req.user.id;
    const {
      following_url,
      starred_url,
      subscriptions_url,
      repos_url,
      events_url,
      avatar_url
    } = req.body;

    User.findById(userID)
      .then(user => {
        if (user._id != userID) {
          return res.status(422).send('Unauthorized');
        }

        User.findByIdAndUpdate(userID, {
          $set: {
            following_url: following_url,
            starred_url: starred_url,
            subscriptions_url: subscriptions_url,
            repos_url: repos_url,
            events_url: events_url,
            avatar_url: avatar_url
          }
        })
          .then(user => {
            if (!user) {
              return res.status(404).send('User not found');
            }
            return res.status(200).send(user.serialize());
          })
          .catch(err => {
            res.status(400).send({ err });
          });
      })
      .catch(err => {
        res.status(400).send({ err });
      });
  });

  app.patch('/api/users/following', jwtAuth, (req, res) => {
    let body = req.body;
    const userID = req.user.id;

    User.findById(userID)
      .then(user => {
        if (user._id != userID) {
          return res.status(422).send('Unauthorized');
        }

        let following_list = [];

        for (let key in body) {
          if (body.hasOwnProperty(key)) {
            following_list.push(body[key].id);
          }
        }

        User.findByIdAndUpdate(userID, {
          $set: {
            following_list: following_list
          }
        })
          .then(user => {
            if (!user) {
              return res.status(404).send('User not found');
            }
            return res.status(200).send(user.serialize());
          })
          .catch(err => {
            res.status(400).send({ err });
          });
      })
      .catch(err => {
        res.status(400).send({ err });
      });
  });
};
