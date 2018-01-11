const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const fs = require('fs');
const handlebars = require('handlebars');

const expirationTime = 60 * 60 * 12;

var User = require('./../models/user');
var Userdata = require('./../models/userdata');
var ResetToken = require('./../models/resetToken');

const viewsPath = '../views/';
const mailUtil = require('./../utils/mail');

router.post('/register', register);
router.post('/login', login);
router.post('/recovery', recovery);
router.post('/reset/:token', reset);
router.post('/activate/:token', activate);
router.post('/userdata', addUserdata);
router.get('/', getAllUser);
router.delete('/:_id', deleteUser);
router.put('/userdata/:_id', updateUserdata);
router.delete('/userdata/:ids', deleteUserdata);



function deleteUser(req, res, next) {
  const id = req.params._id;

  console.log('deleteUser id: ', id);

  User.remove({_id: id})
    .then(function (result) {
      console.log('user removed, result: ', result);
      // res.sendStatus(200);

      return res
      .status(204)
      .json({
        title: 'User deleted successfully'
      });
    })
    .catch(function (err) {
      console.log('User deleted, err:', err);

      return res
      .status(400)
      .json({
        title: 'Error during deleting the user',
        obj: err
      });
    });
}

function getAllUser(req, res, next) {
  User.find().lean()
  .then((result) => {
    const users = _.map(result, function (user) {
      return _.pick(user, '_id', 'firstName', 'lastName', 'email');
    });

    return res
    .status(200)
    .json({
      title: 'Got all users',
      obj: users
    });
  })
  .catch((err) => {
    console.log('Error during getting all users: ', err);

    return res
    .status(400)
    .json({
      title: 'Error during getting all users',
      obj: err
    });
  });

}


function register(req, res, next) {
  var body = req.body;

  User.findOne({email: body.email})
  .then((user) => {

    if (user) {
      // user already registered, registration failed
      return res
      .status(409)
      .json({
        title: 'Registration failed',
        error: {
          message: 'User is already registered'
        }
      });
    }

    // user will be registered, pw is hashed
    const options = {
      hashLength: 128,
      timeCost: 10,
      memoryCost: 15,
      parallelism: 100,
      type: argon2.argon2id
    };

    return argon2.hash(body.password, options);
  })
  .then((hash) => {
    var user = new User({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: hash,
      institution: body.institution
    });

    return user.save();
  })
  .then((result) => {
    // send registration activation mail
    // let activationToken;

    console.log('user registration, user save, result: ', result);

    res.locals.user = result;

    // delete any existing activation token for the user
    ResetToken
      .remove()
      .where('user').equals(result._id)
      .then((opResult) => {
        console.log('remove activation tokens for user ' + result._id +', opResult.results: ', opResult.result);

      })
      .catch((err) => {
        console.log('remove activation tokens for user ' + result._id +', err: ', err);
      });

    // create new activationToken for the user
    const token = jwt.sign(
      {sub: result._id},
      process.env.JWT_SECRET,
      {expiresIn: expirationTime}
    );

    var activationToken = new ResetToken({
      token: token,
      type: 'activate',
      user: result._id
    });

    return activationToken.save();

  })
  .then((activationToken) => {

    const message = `Please activate your account: An email has been sent to ${body.email} with further instructions`;

    console.log('result after saving activation token: ', activationToken);
    console.log('registered user after saving activation token: ', res.locals.user);
    let name = res.locals.user.firstName + ' ' + res.locals.user.lastName;
    let activationUrl = "http://localhost:4200/users/activate/" + activationToken.token;

    let activationData = {
      "name": name,
      "action_url": activationUrl,
      "operating_system": req.headers['user-agent']
    };

    let templateFile = fs.readFileSync(__dirname + '/../views/regactivation.html').toString('utf-8');
    let subject = 'Activate your account for Epi-Lab';
    mailUtil.sendMail(activationData, templateFile, body.email, subject);

    return res
    .status(200)
    .json({
      title: message
    });



    // return res
    // .status(201)
    // .json({
    //   title: 'Registration successful'
    // });
  })
  .catch((err) => {

    console.log('registration error: ', err);

    return res
    .status(500)
    .json({
      title: 'Server error during registration occured',
      error: err
    });
  });
}


function hashPw(password) {
  const options = {
    hashLength: 128,
    timeCost: 10,
    memoryCost: 15,
    parallelism: 100,
    type: argon2.argon2id
  };

  return argon2.hash(password, options);
}

function reset(req, res, next) {
  res.locals.sentResetToken = req.params.token;

  ResetToken
    .find()
    .lean()
    .where('token').equals(res.locals.sentResetToken)
    .then((results) => {
      console.log('searching the transfered reset token, results: ', results);

      if (results.length === 0) {
        console.log('sent reset token not found');

        return res
        .status(400)
        .json({
          title: 'Reset password request expired, please try again'
        });

      }
      res.locals.dbResetToken = results[0];
      res.locals.dbResetToken.user = String(res.locals.dbResetToken.user);

      // verify that sent token has correct user id
      let userId = res.locals.dbResetToken.user;

      try {
        let decoded = jwt.verify(res.locals.sentResetToken, process.env.JWT_SECRET, {subject: userId});
        // console.log('decoded token result: ', decoded);
      } catch(err) {
        console.log('catch error while jwt.verify');

        if (err.name === 'JsonWebTokenError') {
          console.log(err.name, err.message);
        }
        if (err.name === 'TokenExpiredError') {
          console.log(err.name, err.message, err.expiredAt);
        }

        return res
        .status(400)
        .json({
          title: 'Reset password request expired, please try again'
        });
      }

      // sent token ok, start to reset user password
      // hash new password
      return hashPw(req.body.newPw);
    })
    .then((hash) => {
      // password hashing ok
      // update user password

      let userId = res.locals.dbResetToken.user;
      return User.findByIdAndUpdate(userId, {password: hash, updated: Date.now()});
      // return User.findByIdAndUpdate(userId, {password: hash});
    })
    .then((result) => {

      if (!result) {
        // user password was not updated
        console.log('user password was not updated');

        return res
        .status(400)
        .json({
          title: 'Reset password request expired, please try again'
        });

      }

      // password update ok
      // delete reset token
      let userId = res.locals.dbResetToken.user;
      res.locals.user = result;

      ResetToken
      .remove()
      .where('user').equals(userId)
      .then((opResult) => {
        // delete reset token ok
        // send password update verification email

        let name = res.locals.user.firstName + ' ' + res.locals.user.lastName;

        let notificationData = {
          "name": name,
          "email": res.locals.user.email,
          "action_url": "http://localhost:4200/users/login"
        };

        let templateFile = fs.readFileSync(__dirname + '/../views/pwnotification.html').toString('utf-8');
        let subject = 'Reset Password for Epi-Lab Successful';
        mailUtil.sendMail(notificationData, templateFile, res.locals.user.email, subject);

        return res
        .status(200)
        .json({
          title: 'Please login with your new password'
        });

      })
      .catch((err) => {
        // console.log('remove reset tokens for user ' + user._id +', err: ', err);
        console.log('remove reset tokens for user ' + userId +', err: ', err);

        return res
        .status(400)
        .json({
          title: 'Reset password request expired, please try again'
        });
      });
    })
    .catch((err) => {
      console.log('error during password reset: ', err);

      return res
      .status(400)
      .json({
        title: 'Reset password request expired, please try again'
      });

    });
}







function activate(req, res, next) {
  res.locals.sentActivationToken = req.params.token;

  console.log('activate called, activation token: ', res.locals.sentActivationToken);


  // return res
  // .status(200)
  // .json({
  //   title: 'Account activated!'
  // });


  ResetToken
    .find()
    .lean()
    .where('token').equals(res.locals.sentActivationToken)
    .then((results) => {
      console.log('searching the transfered activation token, results: ', results);

      if (results.length === 0) {
        console.log('sent activation token not found');

        return res
        .status(400)
        .json({
          title: 'Account Activation expired, please try again'
        });

      }
      res.locals.dbResetToken = results[0];
      res.locals.dbResetToken.user = String(res.locals.dbResetToken.user);

      // verify that sent token has correct user id
      let userId = res.locals.dbResetToken.user;

      try {
        let decoded = jwt.verify(res.locals.sentActivationToken, process.env.JWT_SECRET, {subject: userId});
        console.log('decoded token result: ', decoded);
      } catch(err) {
        console.log('catch error while jwt.verify');

        if (err.name === 'JsonWebTokenError') {
          console.log(err.name, err.message);
        }
        if (err.name === 'TokenExpiredError') {
          console.log(err.name, err.message, err.expiredAt);
        }

        return res
        .status(400)
        .json({
          title: 'Account Activation expired, please try again'
        });
      }

      // sent token ok, start to activate user account
      return User.findByIdAndUpdate(userId, {enabled: true, updated: Date.now()});













    })
    // .then((hash) => {
    //   // password hashing ok
    //   // update user password

    //   let userId = res.locals.dbResetToken.user;
    //   return User.findByIdAndUpdate(userId, {password: hash, updated: Date.now()});
    //   // return User.findByIdAndUpdate(userId, {password: hash});
    // })
    .then((result) => {

      if (!result) {
        // user account was not activated
        console.log('user was not activated');

        return res
        .status(400)
        .json({
          title: 'Account Activation expired, please try again'
        });

      }

      // account activation ok
      // delete reset token
      let userId = res.locals.dbResetToken.user;
      res.locals.user = result;

      ResetToken
      .remove()
      .where('user').equals(userId)
      .then((opResult) => {
        // delete reset token ok


        // let name = res.locals.user.firstName + ' ' + res.locals.user.lastName;

        // let notificationData = {
        //   "name": name,
        //   "email": res.locals.user.email,
        //   "action_url": "http://localhost:4200/users/login"
        // };

        // let templateFile = fs.readFileSync(__dirname + '/../views/pwnotification.html').toString('utf-8');
        // let subject = 'Reset Password for Epi-Lab Successful';
        // mailUtil.sendMail(notificationData, templateFile, res.locals.user.email, subject);

        return res
        .status(200)
        .json({
          title: 'Account Activation successful!'
        });

      })
      .catch((err) => {
        // console.log('remove reset tokens for user ' + user._id +', err: ', err);
        console.log('remove reset tokens for user ' + userId +', err: ', err);

        return res
        .status(400)
        .json({
          title: 'Account Activation expired, please try again'
        });
      });
    })
    .catch((err) => {
      console.log('error during account activation: ', err);

      return res
      .status(400)
      .json({
        title: 'Account Activation expired, please try again'
      });

    });
}









function recovery(req, res, next) {
  const body = req.body;
  console.log('recovery body: ', body);

  // let user;

  let resetToken;
  const message = `An email has been sent to ${body.email} with further instructions`;

  User.findOne({email: body.email})
  .then((user) => {

    if (!user) {
      // user not found, send password reset help mail
      let resetHelpData = {
        "email_address": body.email,
        "operating_system": req.headers['host'],
        "browser_name": req.headers['user-agent'],
        "action_url": "http://localhost:4200/users/recovery",
        "support_url": "http://localhost:4200/users/recovery"
      };

      let templateFile = fs.readFileSync(__dirname + '/../views/pwresethelp.html').toString('utf-8');
      let subject = 'Reset Password for Epi-Lab';
      mailUtil.sendMail(resetHelpData, templateFile, body.email, subject);

      return res
      .status(200)
      .json({
        title: message
      });
    }

    // user found, send password reset mail
    res.locals.user = user;

    // delete any existing reset tokens for the user
    ResetToken
      .remove()
      .where('user').equals(user._id)
      .then((opResult) => {
        console.log('remove reset tokens for user ' + user._id +', opResult.results: ', opResult.result);

      })
      .catch((err) => {
        console.log('remove reset tokens for user ' + user._id +', err: ', err);
      });

    // create new resetToken for the user
    const token = jwt.sign(
      {sub: res.locals.user._id},
      process.env.JWT_SECRET,
      {expiresIn: expirationTime}
    );

    var resetToken = new ResetToken({
      token: token,
      type: 'reset',
      user: res.locals.user._id
    });

    return resetToken.save();


  })
  .then((resetToken) => {
    console.log('result after saving reset token: ', resetToken);
    console.log('thus.user after saving reset token: ', res.locals.user);
    let name = res.locals.user.firstName + ' ' + res.locals.user.lastName;
    let resetUrl = "http://localhost:4200/users/reset/" + resetToken.token;

    let resetData = {
      "name": name,
      "action_url": resetUrl,
      "operating_system": req.headers['user-agent']
    };

    let templateFile = fs.readFileSync(__dirname + '/../views/pwreset.html').toString('utf-8');
    let subject = 'Reset Password for Epi-Lab';
    mailUtil.sendMail(resetData, templateFile, body.email, subject);

    return res
    .status(200)
    .json({
      title: message
    });
})
  .catch((err) => {
    console.log('error during saving reset token: ', err);
    const errMessage = `An error occured while sending an email to ${body.email} with further instructions. Please try again`;

    return res
    .status(400)
    .json({
      title: errMessage
    });

  });

}


function login(req, res, next) {
  const body = req.body;
  let user;

  User.findOne({email: body.email})
  .populate({path: 'institution userdata'})
  .then((user) => {

    if (!user) {
      // login failed
      return res
      .status(401)
      .json({
        title: 'Login failed',
        error: {
          message: 'Username or password invalid'
        }
      });
    }

    // check if the user's account is activated
    if (! user.enabled) {
      // login failed
      return res
      .status(401)
      .json({
        title: 'Login failed',
        error: {
          message: 'Your account is not yet activated'
        }
      });
    }

    this.user = user;

    // user registered, check password
    const password = body.password;
    const hashedPassword = user.password;

    return argon2.verify(hashedPassword, password);
  })
  .then((match) => {
    if (match) {
      // password matches

      return res
      .status(200)
      .json({
        title: 'Login successful',
        obj: {
          _id: this.user._id,
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          email: body.email,
          token: jwt.sign(
            {sub: this.user._id},
            process.env.JWT_SECRET,
            {expiresIn: expirationTime}
          ),
          institution: this.user.institution,
          userdata: this.user.userdata
        }
      });
    } else {
      // password does not match

      return res
      .status(401)
      .json({
        title: 'Login failed',
        error: {
          message: 'Username or password invalid'
        }
      });
    }
  })
  .catch((err) => {
    console.log('error during authentication! ', err);
  });
};


function addUserdata(req, res, next) {
  const body = req.body;

  var userdata = new Userdata(body.userdata);
  userdata
  .save()
  .then((userdata) => {

    return User.findByIdAndUpdate(
      body.user._id,
      {$push: {userdata: userdata._id}, updated: Date.now()},
      {'new': true}
    )
    .populate({path: 'institution userdata'})
    .lean()
    .then((user) => {
      let pureUser = _.pick(user, '_id', 'firstName', 'lastName', 'email', 'institution', 'userdata');

      return res
      .status(200)
      .json({
        title: 'Adding userdata ok',
        obj: pureUser
      });

    })
    .catch((err) => {
      return res
      .status(400)
      .json({
        title: 'Error saving user',
        obj: err
      });
    });

  })
  .catch((err) => {
    return res
    .status(400)
    .json({
      title: 'Error saving userdata',
      obj: err
    });
  });

}


function updateUserdata(req, res, next) {
  const id = req.params._id;
  const body = req.body;

  return Userdata.findByIdAndUpdate(
    id,
    {$set: {department: body.department,
            contact: body.contact,
            phone: body.phone,
            email: body.email,
            updated: Date.now() }},
    {'new': true}
  )
  .then((userdata) => {

    return res
    .status(200)
    .json({
      title: 'update userdata ok',
      obj: userdata
    });

  })
  .catch((err) => {
    return res
      .status(400)
      .json({
        title: 'err updating userdata',
        obj: err
      });
  });

}


function deleteUserdata(req, res, next) {
  const ids = req.params.ids;
  const entries = ids.split('&');

  if (entries.length < 2) {
    return res
    .status(400)
    .json({
      title: 'bad request deleting userdata'
    });

  }
  const userdataId = entries[0];
  const userId = entries[1];

  return Userdata.findByIdAndRemove(
    userdataId
  )
  .then((removedUserdata) => {

    return User.findByIdAndUpdate(
      userId,
      {$pull: {userdata: userdataId}, updated: Date.now()},
      {'new': true}
    )
    .populate({path: 'institution userdata'})
    .lean();
  })
  .then((updatedUser) => {

    return res
      .status(200)
      .json({
        title: 'delete userdata ok',
        obj: updatedUser
      });
  })
  .catch((err) => {

    return res
    .status(400)
    .json({
      title: 'error deleting userdata',
      obj: err
    });

  });
}


module.exports = router;
