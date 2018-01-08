// for production: set JWT_SECRET
// mongo connection: MONGODB_URI

var env = process.env.NODE_ENV || 'development';

// load json file with test and config variables which is not part of git repository
if (env === 'development' || env === 'test') {
  var config = require('./config.json');
  var envConfig = config[env];

  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  })
}

// console.log("config.js: config.mail.fromAddress: ", config.mail.fromAddress);
const mailConfig = config.mail;

module.exports = {
  mailConfig
}

