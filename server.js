require('./server/config/config');

const http = require('http');
// const app = require('./epilab');
// const config = require('./server/config/config.json');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
var {mongoose} = require('./server/db/mongoose');


console.log('server.js: nach den requires');


// get api routes
const apiRoutes = require('./server/routes/api');
const userRoutes = require('./server/routes/user');

console.log('server.js: nach den const routes');

// mongoose.connect(config.mongoUrl);
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'mongo db error: could not connect to epilab'));
// db.once('open', () => {
//   console.log('server.js: mongo db: connected to epilab');
// })

// console.log('server.js: nach connect to mongodb');


const app = express();

console.log('server.js: nach const app');


// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

console.log('server.js: nach app.use bodyParser');


// Point static path to dist = server application, the only folder accessible from outside
app.use(express.static(path.join(__dirname, 'dist')));

console.log('server.js: nach app.use express.static');



// Set api routes, forwards any request to the routes
app.use('/user',userRoutes);
app.use('/', apiRoutes);

console.log('server.js: nach app.use apiRoutes');


// Catch all other routes and return the index file, angular handles all errors
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

console.log('server.js: nach app.get *');


// Get port from environment and store in Express
// const port = process.env.NODE_ENV === 'production' ? 80 : config.port;
const port = process.env.NODE_ENV === 'production' ? 80 : process.env.NODE_PORT;


console.log('server.js: nach const port');


// const port = process.env.PORT || '3000';
app.set('port', port);

console.log('server.js: nach app.set port');



// Create HTTP server
const server = http.createServer(app);

console.log('server.js: nach const server');



// Listen on provided port, on all network interfaces
server.listen(port, () => console.log(`API running on localhost:${port}`));

console.log('server.js: nach server.listen');





