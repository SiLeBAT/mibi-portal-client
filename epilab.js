const http = require('http');
const express = require('express');
const app = express();

require('./server/routes')(app);

// const server = app.listen(3100, () => {
//   console.log('App started at port 3100');
// });

// Create HTTP server
const server = http.createServer(app);

// Listen on provided port, on all network interfaces
server.listen(3100, () => console.log('App running on localhost:3100'));



