'use strict';

let router = require('express').Router();
router.use('/knime', require('./knime'));
router.use('/institutions', require('./institutions'));

module.exports = router;
