var express = require('express');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var mustache = require('mustache');
var utils = require('../services/utils');
var router = express.Router();

var cometRoutes = './routes/';
var distTemplate = fs.readFileSync(path.resolve(__dirname, 'router.js.tpl')).toString();
var distPath = path.resolve(__dirname, '../public/javascripts');

var cometApi = [];
var cometNamespaces  = [];

fs.readdirSync(path.resolve(__dirname, cometRoutes)).filter(function(file) { return file.match(/\.js$/); }).forEach(function(file) {
  var api = require(cometRoutes + file);
  var namespace = file.split('.')[0];

  cometNamespaces.push({
    namespace: namespace
  });

  _.each(api, function(fn, method) {
    var fnCall;
    var type;
    var route = '/' + utils.toSnake(namespace) + '/' + utils.toSnake(method);

    fn.toString().replace(/\([^)]+\)/, function(fnCall) {
      if (fnCall.split(',').length > 1) {
        type = 'post';
      } else {
        type = 'get';
      }
    });

    cometApi.push({
      namespace: namespace,
      route: '/comet' + route,
      method: method,
      type: type
    });


    router[type](route, function(req, res) {
      function respond(data) {
        res.json(data);
      }
      if (type === 'get') {
        fn(respond);
      } else {
        fn(req.body, respond);
      }
    });
  });
});

if (!fs.existsSync(distPath))
  fs.mkdirSync(distPath);

fs.writeFileSync(path.resolve(distPath, 'comet.router.js'), mustache.render(distTemplate, { routes: cometApi, namespaces: cometNamespaces }));

module.exports = router;