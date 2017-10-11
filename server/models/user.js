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
   orders: [{
     type: Schema.Types.ObjectId,
     ref: 'Order'
   }]
});

userSchema.plugin(mongooseUniqueValidator)

module.exports = mongoose.model('User', userSchema);
