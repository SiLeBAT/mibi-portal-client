const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const mongooseUniqueValidator = require('mongoose-unique-validator');

var resetTokenSchema = new Schema({
  token: {
    type: String,
    required: true
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
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

// userSchema.plugin(mongooseUniqueValidator)

module.exports = mongoose.model('ResetToken', resetTokenSchema);
