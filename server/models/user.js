'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseUniqueValidator = require('mongoose-unique-validator');

var userSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  enabled: {
    type: Boolean,
    default: false,
    required: true
  },
  institution: {
    type: Schema.Types.ObjectId,
    ref: 'Institution'
  },
  userdata: [{
    type: Schema.Types.ObjectId,
    ref: 'Userdata'
  }],
  created: {
    type: Date,
    default: Date.now,
    required: true
  },
  updated: {
    type: Date,
    default: Date.now,
    required: true
  }
});


userSchema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('User', userSchema);
