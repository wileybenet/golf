
var utils= {
  sum: function(arr, prop) {
    return arr.reduce(function(memo, el) {
      return memo + el[prop];
    }, 0);
  },
  average: function(arr, prop) {
    return utils.sum(arr, prop) / arr.length;
  }
};

module.exports = utils;