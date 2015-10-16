var comet = require('../comet.js');
var React = require('react');
var utils = require('../utils');

module.exports = React.createClass({
  getStats: function(props) {    
    comet.api.stats(props.options, function(data) {
      this.setState({
        averageDrive: utils.average(data.drives, 'shot_distance').toFixed(0),
        fir: (data.fir * 100).toFixed(1),
        gir: (data.gir * 100).toFixed(1),
        parSavesCount: data.parSaves[0] + '/' + data.parSaves[1],
        parSavesPercent: (data.parSaves[0] / data.parSaves[1] * 100).toFixed(1),
        scores: data.scores,
        putts: data.putts.toFixed(1)
      });
    }.bind(this));
  },
  getHandicap: function() {
    function bucket(differentials) {
      if (differentials.length < 7) return differentials.slice(0, 1);
      if (differentials.length < 9) return differentials.slice(0, 2);
      if (differentials.length < 11) return differentials.slice(0, 3);
      if (differentials.length < 13) return differentials.slice(0, 4);
      if (differentials.length < 15) return differentials.slice(0, 5);
      if (differentials.length < 17) return differentials.slice(0, 6);
      if (differentials.length < 18) return differentials.slice(0, 7);
      if (differentials.length < 19) return differentials.slice(0, 8);
      if (differentials.length < 20) return differentials.slice(0, 9);
      return differentials.slice(0, 10);
    }
    function index(handicaps) {
      var filteredHandicaps = bucket(handicaps.slice(0, 20).sort(byScore));

      var handicap = utils.average(filteredHandicaps, 'handicap');
      var handicapIndex;
      (handicap * 0.96).toFixed(10).replace(/^[^.]+\../, function(match) {
        handicapIndex = match;
      });
      return handicapIndex;
    }

    function byScore(a, b) {
      if (a.handicap > b.handicap) return 1;
      if (a.handicap < b.handicap) return -1;
      return 0;
    }

    function getHandicap(round) {
      var rating = round[round.tees + '_rating'];
      var slope = round[round.tees + '_slope'];

      return {
        handicap: Math.round((round.total_score - rating) * 113 / slope * 10) / 10
      };
    }

    var handicapIndex;
    var handicaps = this.props.rounds.map(getHandicap);
    if (this.props.index) {
      handicapIndex = index(handicaps);
    } else {
      handicapIndex = handicaps[0].handicap;
    }

    return handicapIndex;
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
    var handicapIndex = this.getHandicap();

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
        <tr><td>Firways In Regulation</td><td className="right">{this.state.fir}%</td></tr>
        <tr><td>Greens In Regulation</td><td className="right">{this.state.gir}%</td></tr>
        <tr><td>Par Saves</td><td className="right">{this.state.parSavesCount} ({this.state.parSavesPercent}%)</td></tr>
        <tr><td>Putts</td><td className="right">{this.state.putts}</td></tr>
        <tr><td>Scores</td><td className="right">{scores}</td></tr>
      </table>
    );
  }
});