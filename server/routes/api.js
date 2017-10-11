const express = require('express');
const router = express.Router();


// render Angular index.html
router.get('/', (request, response, next) => {
  console.log('api.js: in router.get /');

  res.render('index');
})

console.log('api.js: nach router.get /');


// example route
router.get('/api', (req, res, next) => {
  console.log('api.js: in router.get /api');
  res.send('api works');
  // next();
});

console.log('api.js: nach router.get /api');

module.exports = router;
