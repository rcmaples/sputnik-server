const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  github_access_token: {
    type: String,
    trim: true
  },
  following_url: {
    type: String,
    trim: true,
    minlength: 1
  },
  starred_url: {
    type: String,
    trim: true,
    minlength: 1
  },
  subscriptions_url: {
    type: String,
    trim: true,
    minlength: 1
  },
  repos_url: {
    type: String,
    trim: true,
    minlength: 1
  },
  events_url: {
    type: String,
    trim: true,
    minlength: 1
  },
  avatar_url: {
    type: String,
    trim: true,
    minlength: 1
  },
  starred_list: {
    type: Array
  },
  subscriptions_list: {
    type: Array
  },
  repos_list: {
    type: Array
  }
});

UserSchema.methods.serialize = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    github_access_token: this.github_access_token,
    following_url: this.following_url,
    starred_url: this.starred_url,
    subscriptions_url: this.subscriptions_url,
    repos_url: this.repos_url,
    events_url: this.events_url,
    avatar_url: this.avatar_url,
    starred_list: this.starred_list,
    subscriptions_list: this.subscriptions_list,
    repos_list: this.repos_list
  };
};

module.exports = User = mongoose.model('users', UserSchema);
