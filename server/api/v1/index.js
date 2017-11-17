'use strict';

let router = require('express').Router();
router.use('/knime', require('./knime'));

module.exports = router;
