module.exports = require('./Record').createModel({
  constructor: function Round() {
    this.date = new Date();
  },
  schema: [
    'tees'
  ]
});