module.exports = {
  toSnake: function(string) {
    return string.substr(0, 1).toLowerCase() + string.substr(1).replace(/[A-Z]/g, function(match) {
      return '_' + match.toLowerCase();
    });
  }
};