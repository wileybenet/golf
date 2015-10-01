var express = require('express');
var router = express.Router();

var resource = require('../services/resource');

router.use('/score/', resource('Score'));
router.use('/round/', resource('Round'));

module.exports = router;