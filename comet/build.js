var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var mustache = require('mustache');
var utils = require('../services/utils');

function build() {
  var cometRoutes = './routes/';
  var frontDistTemplate = fs.readFileSync(path.resolve(__dirname, 'front.router.js.tpl')).toString();
  var backDistTemplate = fs.readFileSync(path.resolve(__dirname, 'back.router.js.tpl')).toString();
  var distPath = path.resolve(__dirname, '../comet/dist');

  var frontApi = [];
  var backApi = [];
  var filePaths = [];
  var namespaces  = [];

  fs.readdirSync(path.resolve(__dirname, cometRoutes)).filter(function(file) { return file.match(/\.js$/); }).forEach(function(file) {
    var api = require(cometRoutes + file);
    var namespace = file.split('.')[0];

    namespaces.push({
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

      frontApi.push({
        namespace: namespace,
        route: '/comet' + route,
        method: method,
        type: type
      });

      backApi.push({
        namespace: namespace,
        type: type,
        route: route,
        fnName: method,
        body: type === 'post'
      });

    });
  });

  if (!fs.existsSync(distPath))
    fs.mkdirSync(distPath);

  fs.writeFileSync(path.resolve(distPath, 'comet.front.router.js'), mustache.render(frontDistTemplate, { routes: frontApi, namespaces: namespaces }));
  fs.writeFileSync(path.resolve(distPath, 'comet.back.router.js'), mustache.render(backDistTemplate, { namespaces: namespaces, routes: backApi }));
  console.log('successfully built comet assets');
}

module.exports = {
  build: build
};