var _ = require('lodash');
var Record = require('../../models/Record');
var Round = require('../../models/Round');
var Score = require('../../models/Score');
var Hole = require('../../models/Hole');
var Shot = require('../../models/Shot');
var Course = require('../../models/Course');

module.exports = {
  courses: function(callback) {
    Course.all().then(callback);
  },
  rounds: function(callback) {
    Round
      .select([
        "*",
        "rounds.id AS 'id'",
        "DATE_FORMAT(date, '%b %d, %Y') AS 'date_str'",
        "SUM(score) AS 'total_score'",
        "SUM(par) AS 'total_par'",
        "SUM(pros) AS 'pros_dist'",
        "SUM(tips) AS 'tips_dist'"])
      .joins("INNER JOIN courses ON courses.id = rounds.course_id "+
        "LEFT JOIN scores ON scores.round_id = rounds.id "+
        "LEFT JOIN holes ON holes.id = scores.hole_id")
      .group('rounds.id')
      .order('date_str')
      .then(function(data) {
        var counts = {};
        data = data.reverse().map(function(round) {
          counts[round.course_id] = counts[round.course_id] || 1;
          round.round_number = counts[round.course_id]++;
          return round;
        }).reverse();
        callback(data);
      });
  },
  saveRound: function(options, callback) {
    Record.query('INSERT INTO rounds SET ?', [{course_id: options.courseId, tees: options.tees}], function(err, data) {
      var cols = ['round_id', 'hole_id', 'score', 'fir', 'gir', 'putts'];
      options.scores.forEach(function(hole) {
        hole.round_id = data.insertId;
      });
      Record.query('INSERT INTO scores (??) VALUES ?', [cols, _.valuesAt(options.scores, cols)], function(err, data) {
        callback(data);
      });
    });
  },
  scores: function(options, callback) {
    Score.select(["*",
        "scores.id AS 'score_id'",
        "score - par AS 'over_under'"]).joins("INNER JOIN holes ON holes.id = scores.hole_id").where({
      'scores.round_id': options.round_id
    }).then(callback);
  },
  shots: function(options, callback) {
    Shot
      .select(["shots.*"])
      .joins("INNER JOIN scores ON scores.id = shots.score_id INNER JOIN rounds ON rounds.id = scores.round_id")
      .where(options)
      .then(function(shots) {
        callback(_.groupBy(shots, 'score_id'));
      });
  },
  holes: function(options, callback) {
    Hole.where(options).then(callback);
  },
  saveShots: function(options, callback) {
    if (!options.shots.length)
      return callback({ empty: true });

    var cols = ['score_id', 'number', 'x', 'y'];
    Record.query("DELETE FROM shots WHERE ?", [{ score_id: options.shots[0].score_id }], function(err, data) {
      Record.query("INSERT INTO shots (??) VALUES ?", [cols, _.valuesAt(options.shots, cols)], function(err, data) {
        callback({ success: true });
      });
    });
  }
};

