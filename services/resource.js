var utils = require('./utils');
var express = require('express');

module.exports = function(name) {
  var router = express.Router();
  var Model = require('../models/' + name);

  router.get('/', function(req, res) {
    Model.all().then(res.json.bind(res));
  });
  router.get('/:id', function(req, res) {
    Model.find(req.params.id).then(res.json.bind(res));
  });
  router.put('/:id', function(req, res) {
    Model.find(req.params.id).then(function(model) {
      model.update(req.body, res.json.bind(res));
    });
  });
  router.post('/', function(req, res) {
    var model = new Model(req.body);
    console.log(model);
    model.save(res.json.bind(res));
  });
  router.delete('/:id', function(req, res) {
    Model.find(req.params.id).then(function(model) {
      model.delete(res.json.bind(res));
    });
  });

  return router;
};