'use strict';

let router = require('express').Router();
let multer = require('multer');

let storage = multer.diskStorage({ //multers disk storage settings
  destination: function (req, file, cb) {
      cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    console.log('inside storage, file: ', file);
      // var datetimestamp = Date.now();
      cb(null, Date.now() + '.' + file.originalname);
  }
});

let multerUpload = multer({ //multer settings
              storage: storage
          }).single('myPostName');

router.post('/', function(req, res) {

  multerUpload(req, res, function (err) {
    if (err) {
      // An error occurred when uploading
      return res
      .status(400)
      .json({
        title: 'error during file uploading, please try again',
        obj: err
      });
    }

    // Everything went fine
    return res
    .status(200)
    .json({
      title: 'file upload done successfully'
    });
  })

});

module.exports = router;
