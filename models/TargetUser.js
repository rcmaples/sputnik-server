const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TargetUserSchema = Schema(
  {
    github_id: {
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
    },
    events_url: {
      type: String,
      required: true,
      trim: true,
      minlength: 1
    },
    url: {
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

TargetUserSchema.methods.serialize = function() {
  return {
    github_id: this.github_id,
    login: this.login,
    avatar_url: this.avatar_url,
    html_url: this.html_url,
    events_url: this.events_url,
    url: this.url,
    events_list: this.events_list
  };
};

module.exports = TargetUser = mongoose.model('targetUsers', TargetUserSchema);
