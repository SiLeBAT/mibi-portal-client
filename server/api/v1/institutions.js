'use strict';

let router = require('express').Router();
let controller = require('./../../controllers/institutions');


router.route('/')
  .get(controller.list);

// router.get('/', getAllInstitutions);

function getAllInstitutions(req, res, next) {

  console.log('getAllInstitutions called');

  // User.find().lean()
  // .then((result) => {
  //   const users = _.map(result, function (user) {
  //     return _.pick(user, '_id', 'firstName', 'lastName', 'email');
  //   });

  //   return res
  //   .status(200)
  //   .json({
  //     title: 'Got all users',
  //     obj: users
  //   });
  // })
  // .catch((err) => {
  //   console.log('Error during getting all users: ', err);

  //   return res
  //   .status(400)
  //   .json({
  //     title: 'Error during getting all users',
  //     obj: err
  //   });
  // });

  return res
  .status(200)
  .json({
    title: 'Got all institutions'
  })
}

module.exports = router;
