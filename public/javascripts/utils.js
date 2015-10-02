(function() {

  var utils = {
    sum: function(arr, prop) {
      return arr.reduce(function(memo, el) {
        return memo + el[prop];
      }, 0);
    }
  };

  window.utils = utils;

}());