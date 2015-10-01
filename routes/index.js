var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
    title: 'Home',
    env: process.env.ENV
  });
});

module.exports = router;