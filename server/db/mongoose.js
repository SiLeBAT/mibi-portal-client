var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

// mongoose.connect(config.mongoUrl);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo db error: could not connect to epilab'));
db.once('open', () => {
const db = mongoose.connection;
  console.log('mongoose.js: mongo db: connected to epilab');
})

console.log('mongoose.js: nach connect to mongodb');


module.exports = {
  mongoose
};
