module.exports = require('./Record').createModel({
  constructor: function Shot() {},
  staticMethods: {
    withScores: function() {
      this.joins("LEFT JOIN scores ON scores.id = shots.score_id");
    },
    withScoresAndHoles: function() {
      this.withScores().joins("LEFT JOIN holes ON holes.id = scores.hole_id");
    }
  }
});