var React = require('react');
var utils = require('../utils');
var emitter = require('./emitter');
var Hole = require('./Hole');

module.exports = React.createClass({
  componentDidMount: function() {
    var this_ = this;
    function select(dir) {
      return function(data) {
        var idx = this_.props.data.findIndex(function(el) {
          return el.id === data.id;
        });
        emitter.emit('hole.select', {
          hole: this_.props.data[(idx + dir + 18) % 18],
          round: this_.props.round
        });
      };
    }
    emitter.on('hole.next', select(1));
    emitter.on('hole.prev', select(-1));
  },
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
        <div className="hole" key={idx}>
          <Hole data={hole} round={round} />
        </div>
      );
    });


    holeNodes.unshift((
      <div className="hole summary" key="headers">
        <Hole data={headers} round={round} />
      </div>
    ));
    
    holeNodes.splice(10, 0, (
      <div className="hole summary" key="front">
        <Hole data={frontNine} round={round} />
      </div>
    ));

    holeNodes.push((
      <div className="hole summary" key="back">
        <Hole data={backNine} round={round} />
      </div>
    ));

    holeNodes.push((
      <div className="hole summary" key="all">
        <Hole data={eighteen} round={round} />
      </div>
    ));

    return (
      <div className="scorecard">
        {holeNodes}
      </div>
    );
  }
});