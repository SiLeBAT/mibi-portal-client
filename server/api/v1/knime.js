'use strict';

let router = require('express').Router();
let request = require('request');

router.post('/', upload);

function upload(req, res, next) {

  const urlJobId = 'https://knime.bfrlab.de/com.knime.enterprise.server/rest/v4/repository/EpiLab/MiBi-Portal_v14_03:jobs';
  const urlResult = 'https://knime.bfrlab.de/com.knime.enterprise.server/rest/v4/jobs/';
  const authValue = req.body.authValue;
  console.log('authValue: ', authValue);

  // var options = { method: 'POST',
  // url: urlJobId,
  // headers: {
  //   // 'postman-token': '2f47a998-4814-b98e-bf95-2a99e89b8749',
  //   'cache-control': 'no-cache',
  //   authorization: authValue
  // }};

  // request(options, (error, response, body) => {
  //   if (error) {
  //     throw new Error(error);

  //     return res
  //     .status(400)
  //     .json({
  //       title: 'Error calling knime job id'
  //     });

  //   }

  //   console.log(body);
  //   let jsonBody = JSON.parse(body);
  //   console.log('job ID: ', jsonBody.id);
  // });



  return res
  .status(200)
  .json({
    title: 'knime upload was called'
  });

}

module.exports = router;
