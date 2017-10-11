const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const config = require('./server/config.json');
const mongoose = require('mongoose');

console.log('epilab.js: nach den requires');


// get api routes
const apiRoutes = require('./server/routes/api');
const userRoutes = require('./server/routes/user');

console.log('epilab.js: nach den const routes');

// connect to mongoose on each request
mongoose.connect(config.mongoUrl);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo db error: could not connect to epilab'));
db.once('open', () => {
  console.log('epilab.js: mongo db: connected to epilab');
})

console.log('epilab.js: nach connect to mongodb');


const app = express();

console.log('epilab.js: nach const app');


// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

console.log('epilab.js: nach app.use bodyParser');


// Point static path to dist = server application, the only folder accessible from outside
app.use(express.static(path.join(__dirname, 'dist')));

console.log('epilab.js: nach app.use express.static');



// Set api routes, forwards any request to the routes
app.use('/user',userRoutes);
app.use('/', apiRoutes);

console.log('epilab.js: nach app.use apiRoutes');


// Catch all other routes and return the index file, angular handles all errors
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

console.log('epilab.js: nach app.get *');


module.exports = app;


