
module.exports = {
  sum: function(arr, prop) {
    return arr.reduce(function(memo, el) {
      return memo + el[prop];
    }, 0);
  }
};