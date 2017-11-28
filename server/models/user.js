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
  institution: {
    type: Schema.Types.ObjectId,
    ref: 'Institution'
  },
  created: {
    type: Date,
    default: Date.now,
    required: true
  },
  updated: {
    type: Date,
    default: Date.now,
    required: true
  },
  orders: [{
    type: Schema.Types.ObjectId,
    ref: 'Order'
  }]
});


userSchema.plugin(mongooseUniqueValidator);

// does not execute
// userSchema.pre('update', (next) => {
//   // update the time stamp
//   this.updated = Date.now();

//   console.log('userSchema.pre running');

//   return next();
// })

module.exports = mongoose.model('User', userSchema);
