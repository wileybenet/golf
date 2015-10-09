var comet = require('../comet.js');
var React = require('react');
var utils = require('../utils');

module.exports = React.createClass({
  getStats: function(props) {    
    comet.api.stats(props.options, function(data) {
      this.setState({
        averageDrive: utils.average(data.drives, 'shot_distance'),
        gir: (data.gir * 100).toFixed(1),
        parSaves: (data.parSaves * 100).toFixed(1),
        scores: data.scores,
        putts: data.putts.toFixed(1)
      });
    }.bind(this));
  },
  componentDidMount: function() {
    this.getStats(this.props);
  },
  componentWillReceiveProps: function(props) {
    this.getStats(props);
  },
  getInitialState: function() {
    return {
      scores: []
    };
  },
  render: function() {
    function getHandicap(round) {
      var rating = round[round.tees + '_rating'];
      var slope = round[round.tees + '_slope'];

      return {
        handicap: Math.round((round.total_score - rating) * 113 / slope * 10) / 10
      };
    }

    var handicaps = this.props.rounds.map(getHandicap);
    var handicap = utils.average(handicaps, 'handicap');
    var handicapIndex;
    (handicap * 0.96).toFixed(10).replace(/^[^.]+\../, function(match) {
      handicapIndex = match;
    });

    var scores = this.state.scores.map(function(scoreCount, idx) {
      var score = idx - 2;
      var overUnder = 'over-under tiny over-under-' + score;
      return (
        <div className={overUnder}>{scoreCount}</div>
      );
    });
    return (
      <table className="handicap-summary small">
        <tr><td>Handicap</td><td className="right">{handicapIndex}</td></tr>
        <tr><td>Average Drive</td><td className="right">{this.state.averageDrive} yds</td></tr>
        <tr><td>Greens In Regulation</td><td className="right">{this.state.gir}%</td></tr>
        <tr><td>Par Saves</td><td className="right">{this.state.parSaves}%</td></tr>
        <tr><td>Avg. Putts per Round</td><td className="right">{this.state.putts}</td></tr>
        <tr><td>Scores</td><td className="right">{scores}</td></tr>
      </table>
    );
  }
});