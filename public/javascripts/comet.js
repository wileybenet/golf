var cometRouter = require('./comet.router.js');

function uri(ns, method) {
  return '/comet/' + ns + '/' + method;
}

var comet = {
  $get: function(route, callback) {
    $.get(route, callback);
  },
  $post: function(route, data, callback) {
    $.ajax({
      type: 'POST',
      url: route,
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: callback
    });
  }
};

cometRouter(comet);

module.exports = comet;