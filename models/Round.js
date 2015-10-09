module.exports = require('./Record').createModel({
  constructor: function Round() {
    this.date = new Date();
  },
  staticMethods: {
    groupTotals: function() {
      this.select([
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
      .order('date DESC');
    },
  },
  schema: [
    'tees'
  ]
});