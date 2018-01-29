require('./server/config/config');

const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');

var {mongoose} = require('./server/db/mongoose');

const app = express();

console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
console.log('process.env.NODE_PORT: ', process.env.NODE_PORT);
console.log('process.env.API_URL: ', process.env.API_URL);


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
    /\/users\/reset\/*/,
    /\/users\/activate\/*/
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
// const userRoutes = require('./server/routes/user');


// Point static path to dist = server application, the only folder accessible from outside
app.use(express.static(path.join(__dirname, 'dist')));

app.use(function (req, res, next) {
  // res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, GET, PATCH, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Credentials", true);
  next();
});



// Set api routes, forwards any request to the routes
app.use('/users',require('./server/routes/user'));
app.use('/api', require('./server/api'));


// Catch all other routes and return the index file, angular handles all errors
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});


// Get port from environment and store in Express
// const port = process.env.NODE_ENV === 'production' ? 80 : process.env.NODE_PORT;
const port = process.env.NODE_PORT;


app.set('port', port);


// Create HTTP server
const server = http.createServer(app);


// Listen on provided port, on all network interfaces
server.listen(port, () => console.log(`API running on localhost:${port}`));






