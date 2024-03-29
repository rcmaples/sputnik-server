'use strict';

const _ = {
  get: require('lodash.get'),
  isboolean: require('lodash.isboolean'),
  mapKeys: require('lodash.mapkeys'),
  pick: require('lodash.pick'),
  filter: require('lodash.filter')
};

const passport = require('passport');
const jwtAuth = passport.authenticate('jwt', { session: false });
const axios = require('axios');
const User = require('../../models/User');
const Repo = require('../../models/Repo');
const Event = require('../../models/Event');
const TargetUser = require('../../models/TargetUser');

const handleEvents = async (events, callback) => {
  for (let item of events) {
    await Event.findOne({ id: item.id }).then(async event => {
      if (!event) {
        const newEvent = new Event({
          id: item.id,
          type: item.type,
          actor: item.actor,
          repo: item.repo,
          payload: item.payload,
          public: item.public,
          created_at: item.created_at
        });
        await newEvent
          .save()
          .then(event => callback(event.id))
          .catch(error => {
            throw new Error(error);
          });
      }
    });
  }
};

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
          if (targetUser) {
            return res.status(400).json({ error: 'Record already exists' });
          }

          const newTargetUser = new TargetUser({
            github_id: id,
            login: login,
            avatar_url: avatar_url,
            html_url: html_url,
            events_url: events_url.replace(/{.+/g, '').trim(),
            url: url,
            events_list: []
          });
          newTargetUser
            .save()
            .then(targetUser => {
              // Update Target User Events
              // GET targetUser.events_url
              axios
                .get(targetUser.events_url)
                .then(async response => {
                  const events = _.filter(response.data, event => {
                    return event.type === 'CreateEvent' ||
                      event.type === 'FollowEvent' ||
                      event.type === 'ForkEvent' ||
                      event.type === 'PullRequestEvent' ||
                      event.type === 'PushEvent' ||
                      event.type === 'ReleaseEvent' ||
                      event.type === 'WatchEvent'
                      ? true
                      : false;
                  });

                  const remaining = response.headers['x-ratelimit-remaining'];
                  let eventIds = [];
                  // Add Events from above into MongoDB
                  await handleEvents(events, id => {
                    eventIds.push(id);
                  });

                  TargetUser.findByIdAndUpdate(
                    targetUser._id,
                    {
                      $set: { events_list: [...eventIds] }
                    },
                    { new: true }
                  ).catch(error => {
                    res.send(500).send(error);
                  });

                  res.send({
                    eventIds
                  });
                })
                .catch(error => {
                  res.status(422).send(error);
                });
            })
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
