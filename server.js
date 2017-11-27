require('./server/config/config');

const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');

var {mongoose} = require('./server/db/mongoose');

const app = express();


// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));


// use JWT auth to secure the api, the token is passed in the authorization header
app.use(expressJwt({
  secret: process.env.JWT_SECRET,
  getToken: function (req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } /*else if (req.query && req.query.token) {
        return req.query.token;
    }*/
    return null;
  }
}).unless({ path: [
    '/api/v1/institutions',
    '/users/login',
    '/users/register',
    '/users/recovery',
    /\/users\/reset\/*/
  ]
}));

// verify token expiration
app.use((err, req, res, next) => {
  if (err.status === 401) {
    return res
    .status(401)
    .sendFile(path.join(__dirname, 'dist/index.html'));
  }
});


// get api routes
// const apiRoutes = require('./server/routes/api');
const userRoutes = require('./server/routes/user');


// Point static path to dist = server application, the only folder accessible from outside
app.use(express.static(path.join(__dirname, 'dist')));


// Set api routes, forwards any request to the routes
app.use('/users',userRoutes);
// app.use('/', apiRoutes);
app.use('/api', require('./server/api'));


// Catch all other routes and return the index file, angular handles all errors
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});


// Get port from environment and store in Express
// const port = process.env.NODE_ENV === 'production' ? 80 : config.port;
const port = process.env.NODE_ENV === 'production' ? 80 : process.env.NODE_PORT;


// const port = process.env.PORT || '3000';
app.set('port', port);


// Create HTTP server
const server = http.createServer(app);


// Listen on provided port, on all network interfaces
server.listen(port, () => console.log(`API running on localhost:${port}`));






