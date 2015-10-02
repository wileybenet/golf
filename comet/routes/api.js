var Round = require('../../models/Round');
var Score = require('../../models/Score');

module.exports = {
  rounds: function(callback) {
    Round
      .select([
        "*",
        "DATE_FORMAT(date, '%b %d, %Y') AS 'date_str'",
        "SUM(score) AS 'total_score'",
        "SUM(par) AS 'total_par'",
        "SUM(pros) AS 'pros_dist'",
        "SUM(tips) AS 'tips_dist'"])
      .joins("INNER JOIN courses ON courses.id = rounds.course_id "+
        "LEFT JOIN scores ON scores.round_id = rounds.id "+
        "LEFT JOIN holes ON holes.id = scores.hole_id")
      .group('round.id')
      .then(callback);
  },
  scores: function(options, callback) {
    Score.joins("INNER JOIN holes ON holes.id = scores.hole_id").where({
      'scores.round_id': options.round_id
    }).then(callback);
  }
};

