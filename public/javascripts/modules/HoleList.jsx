var React = require('react');
var utils = require('../utils');
var Hole = require('./Hole');

module.exports = React.createClass({
  render: function() {
    function calcSide(side, arr, round) {
      var nonPar3 = arr.filter(function(el) {
        return el.par !== 3;
      });
      return {
        number: side,
        pros: utils.sum(arr, round.tees),
        tips: utils.sum(arr, round.tees),
        par: utils.sum(arr, 'par'),
        score: utils.sum(arr, 'score'),
        gir: arr.filter(function(el) {
          return el.gir;
        }).length,
        fir: nonPar3.filter(function(el) {
          return el.fir;
        }).length + '/' + nonPar3.length,
        putts: utils.sum(arr, 'putts')
      };
    }

    var summary = {
      saves: this.props.data.filter(function(el) {
        return !el.gir && (el.par >= el.score);
      }).length,
      totalMisses: this.props.data.filter(function(el) {
        return !el.gir;
      }).length,
      pars: this.props.data.filter(function(el) {
        return el.par === el.score;
      }).length
    };

    var headers = {
      align: 'left',
      number: 'Hole',
      pros: 'Distance',
      tips: 'Distance',
      par: 'Par',
      score: 'Score',
      fir: 'FIR',
      gir: 'GIR',
      putts: 'Putts'
    };
    var front = this.props.data.slice(0, 9);
    var frontNonPar3 = front.filter(function(el) {
      return el.par !== 3;
    });
    var frontNine = calcSide('Out', this.props.data.slice(0, 9), this.props.round);
    var backNine = calcSide('In', this.props.data.slice(9, 18), this.props.round);
    var eighteen = calcSide('Total', this.props.data, this.props.round);

    var round = this.props.round;

    var holeNodes = this.props.data.map(function(hole, idx) {
      return (
        <div className="hole">
          <Hole data={hole} round={round} />
        </div>
      );
    });


    holeNodes.unshift((
      <div className="hole">
        <Hole data={headers} round={round} />
      </div>
    ));
    
    holeNodes.splice(10, 0, (
      <div className="hole">
        <Hole data={frontNine} round={round} />
      </div>
    ));

    holeNodes.push((
      <div className="hole">
        <Hole data={backNine} round={round} />
      </div>
    ));

    holeNodes.push((
      <div className="hole">
        <Hole data={eighteen} round={round} />
      </div>
    ));

    return (
      <div>
        {holeNodes}
        <div>
          Par Saves: {summary.saves}/{summary.totalMisses}<br />
          Pars: {summary.pars}
        </div>
      </div>
    );
  }
});