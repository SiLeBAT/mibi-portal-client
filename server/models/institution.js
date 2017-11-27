'use strict'

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const mongooseUniqueValidator = require('mongoose-unique-validator');

var institutionSchema = new Schema({
  short: {
    type: String,
    required: true
  },
  name1: {
    type: String,
    required: true
  },
  name2: {
    type: String
  },
  location: {
    type: String,
    required: true
  },
  address1: {
    street: {
      type: String
    },
    city: {
      type: String
    }
  },
  address2: {
    street: {
      type: String
    },
    city: {
      type: String
    }
  },
  phone: {
    type: String,
    required: true
  },
  fax: {
    type: String,
    required: true
  },

  email: [{
    type: String
  }],
  state_id: {
    type: ObjectId,
    ref: 'State'
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
  }
});

// institutionSchema.plugin(mongooseUniqueValidator);

// does not execute
// userSchema.pre('update', (next) => {
//   // update the time stamp
//   this.updated = Date.now();

//   console.log('userSchema.pre running');

//   return next();
// })

module.exports = mongoose.model('Institution', institutionSchema);
