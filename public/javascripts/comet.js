(function(namespace) {

  function uri(ns, method) {
    return '/comet/' + ns + '/' + method;
  }

  var comet = {
    $get: function(route, callback) {
      $.get(route).success(callback);
    },
    $post: function(route, data, callback) {
      $.post(route, data).success(callback);
    }
  };

  namespace.comet = comet;

}(window));