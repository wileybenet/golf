module.exports = require('./Record').createModel({
  constructor: function Shot() {},
  staticMethods: {
    withScores: function() {
      this.joins("INNER JOIN scores ON scores.id = shots.score_id");
    },
    withScoresAndHoles: function() {
      this.withScores().joins("INNER JOIN holes ON holes.id = scores.hole_id");
    }
  }
});