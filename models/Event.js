'use strict';
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = Schema(
  {
    id: {
      type: Number,
      trim: true,
      unique: true,
      required: true
    },
    type: {
      type: String,
      trim: true,
      required: true
    },
    actor: {
      id: {
        type: Number,
        trim: true,
        required: true
      },
      display_login: {
        type: String,
        trim: true,
        required: true
      },
      avatar_url: {
        type: String,
        trim: true,
        required: true
      }
    },
    public: {
      type: Boolean,
      required: true
    },
    created_at: {
      type: Date
    }
  },
  { timestamps: true }
);

EventSchema.methods.serialize = function() {
  return {
    id: this.id,
    type: this.type,
    actor: this.actor,
    public: this.public,
    created_at: this.created_at
  };
};

module.exports = Event = mongoose.model('events', EventSchema);
