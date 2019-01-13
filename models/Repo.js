'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RepoSchema = Schema(
  {
    id: {
      type: Number,
      required: true,
      trim: true,
      minlength: 1,
      unique: true
    },
    name: {
      type: String
    },
    private: {
      type: Boolean,
      required: true
    },
    owner: {
      id: {
        type: Number,
        required: true,
        trim: true,
        minlength: 1,
        unique: true
      },
      login: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true
      },
      avatar_url: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
      },
      html_url: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
      }
    },
    html_url: {
      type: String,
      required: true,
      trim: true,
      minlength: 1
    },
    events_url: {
      type: String,
      required: true,
      trim: true,
      minlength: 1
    },
    events_list: {
      type: Array
    }
  },
  { timestamps: true }
);

RepoSchema.methods.serialize = function() {
  return {
    id: this.id,
    name: this.name,
    private: this.private,
    owner: this.owner,
    html_url: this.html_url,
    events_url: this.events_url,
    events_list: this.events_list
  };
};

module.exports = Repo = mongoose.model('repos', RepoSchema);
