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
    Round.groupTotals().then(function(data) {
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
  stats: function(options, callback) {
    Shot
      .select([
        "*",
        "shots.number AS 'shot_number'",
        "holes.number AS 'hole_number'",
        "scores.id AS 'score_id'"])
      .withScoresAndHoles()
      .where(options)
      .then(function(data) {
        var holes = _(data)
          .groupBy('score_id')
          .map(function(shots, scoreId) {
            return shots[0];
          })
          .value();
        var drives = _(data)
          .filter(function(el) {
            return el.shot_number < 2 && el.fir === 1 && el.par > 3;
          })
          .groupBy('score_id')
          .map(function(shots, id) {
            return {
              hole: shots[0].hole_number,
              shot_distance: Math.round(Math.sqrt(Math.pow(shots[1].x - shots[0].x, 2) + Math.pow(shots[1].y - shots[0].y, 2)) * shots[0].scale_factor)
            };
          });
        var greensInReg = holes
          .filter(function(el) {
            return el.gir === 1;
          }).length / holes.length;
        var missedGreens = holes.filter(function(el) {
            return el.gir === 0;
          });
        var parSaves = missedGreens.filter(function(el) {
            return el.score <= el.par;
          }).length / missedGreens.length;

        var eagles = holes.filter(function(el) { return el.score === el.par - 2; }).length;
        var birdies = holes.filter(function(el) { return el.score === el.par - 1; }).length;
        var pars = holes.filter(function(el) { return el.score === el.par; }).length;
        var bogies = holes.filter(function(el) { return el.score === el.par + 1; }).length;
        var dblPlus = holes.filter(function(el) { return el.score > el.par + 1; }).length;

        var putts = holes.reduce(function(memo, el) { return memo + el.putts; }, 0) / _.uniq(holes, 'round_id').length;

        callback({
          drives: drives,
          gir: greensInReg,
          parSaves: parSaves,
          scores: [eagles, birdies, pars, bogies, dblPlus],
          putts: putts
        });
      });
  },
  scores: function(options, callback) {
    Score.select([
      "*",
      "scores.id AS 'score_id'",
      "score - par AS 'over_under'"])
    .joins("INNER JOIN holes ON holes.id = scores.hole_id")
    .where({
      'scores.round_id': options.round_id})
    .then(callback);
  },
  shots: function(options, callback) {
    Shot
      .select(["shots.*"])
      .withScores()
      .joins("INNER JOIN rounds ON rounds.id = scores.round_id")
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

