module.exports = {
  valuesAt: function(objArr, keyArr) {
    return objArr.map(function(obj) {
      return keyArr.map(function(key) {
        return obj[key];
      });
    });
  }
};