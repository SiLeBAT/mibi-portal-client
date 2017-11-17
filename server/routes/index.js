const _ =require('lodash');
const fs = require('fs');
// const excluded = ['index', 'api', 'order', 'user'];
const excluded = ['index'];

module.exports = function(app) {
  fs.readdirSync(__dirname).forEach(function(file) {
    // remove extension from file name
    var basename = file.split('.')[0];

    // only load files that aren't directories and aren't blacklisted
    if (!fs.lstatSync(__dirname + '/' + file).isDirectory() && !_.includes(excluded, file)) {
      app.use('/' + basename, require('./' + file));
    }
  });
};
