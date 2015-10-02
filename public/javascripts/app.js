var App = React.createClass({
  selectRound: function(round) {
    this.setState({ round: round });
  },
  getInitialState: function() {
    return { round: {} };
  },
  render: function() {
    return (
      <div className="app">
        <Rounds className="rounds" onSelect={this.selectRound} />
        { this.state.round.id ? <Scorecard className="scorecard" round={this.state.round} /> : null }
      </div>);
  }
});

var Rounds = React.createClass({
  componentDidMount: function() {
    comet.api.rounds(function(data) {
      this.setState({ data: data });
    }.bind(this));
  },
  getInitialState: function() {
    return { data: [] };
  },
  render: function() {
    return (
      <div>
        <Summary data={this.state.data} />
        <RoundList data={this.state.data} onSelect={this.props.onSelect} />
      </div>
    );
  }
});

var RoundList = React.createClass({
  render: function() {
    var selectFn = this.props.onSelect;
    var roundNodes = this.props.data.map(function(round, idx) {
      return (
        <Round round={round} key={idx} onSelect={selectFn} />
      );
    });
    return (
      <div className="round-list">
        {roundNodes}
      </div>);
  }
});

var Round = React.createClass({
  select: function() {
    this.props.onSelect(this.props.round);
  },
  render: function() {
    var map = '/images/course_layout/' + this.props.round.id + '.jpg';
    var toPar = this.props.round.total_score - this.props.round.total_par;
    var overUnder = (toPar > 0) ? 'over' : 'under'; 
    return (
      <div onClick={this.select}>
        <div className="middle">
          <img src={map} width="100" />
        </div>
        <div className="middle">
          {this.props.round.name}
          <div className="small">{this.props.round.date_str}</div>
          <div className="small">Par {this.props.round.total_par} shot {toPar} {overUnder} {this.props.round.total_score}</div>
        </div>
      </div>
    );
  }
});

var Summary = React.createClass({
  render: function() {
    function getHandicap(round) {
      var rating = round[round.tees + '_rating'];
      var slope = round[round.tees + '_slope'];

      return {
        handicap: ((round.total_score - rating) * 113 / slope).toFixed(1)
      };
    }

    var handicaps = this.props.data.map(getHandicap);
    var handicap = (utils.sum(handicaps, 'handicap') / handicaps.length).toFixed(1);
    return (
      <div className="summary">
        <div>Handicap {handicap}</div>
      </div>);
  }
});

var Scorecard = React.createClass({
  componentDidMount: function() {
    comet.api.scores({ round_id: this.props.round.id }, function(data) {
      this.setState({ data: data });
    }.bind(this));
  },
  getInitialState: function() {
    return { data: [] };
  },
  render: function() {
    return (
      <HoleList round={this.props.round} data={this.state.data} />
    );
  }
});

var HoleList = React.createClass({
  render: function() {
    function formatHoles(arr, back) {
      var this_ = this;
      var rows = {
        imgNodes: [],
        holeNodes: [],
        distNodes: [],
        parNodes: [],
        scoreNodes: [],
        girNodes: [],
        puttNodes: []
      };
      var sideScore = utils.sum(arr, 'score');
      var totalScore;
      var totalGir;
      var totalDist;
      var totalPar;
      var totalPutts;
      var nonPar3 = arr.filter(function(el) {
        return el.par !== 3;
      });
      var sideGir = nonPar3.filter(function(el) {
        return el.gir;
      }).length + '/' + nonPar3.length;
      var side = back ? 'In' : 'Out';
      var sideDist = utils.sum(arr, this.props.round.tees);
      var sidePar = utils.sum(arr, 'par');
      var sidePutts = utils.sum(arr, 'putts');

      if (!back) {
        rows.imgNodes.push(<td></td>);
        rows.holeNodes.push(<td className="first">Hole</td>);
        rows.distNodes.push(<td className="first">Distance</td>);
        rows.parNodes.push(<td className="first">Par</td>);
        rows.scoreNodes.push(<td className="first">Score</td>);
        rows.girNodes.push(<td className="first">GIR</td>);
        rows.puttNodes.push(<td className="first">Putts</td>);
      }

      arr.forEach(function(hole, idx) {
        var style = {
          backgroundImage: 'url(images/holes/' + hole.course_id + '-' + hole.number + '.png)'
        };
        var gir = (hole.par !== 3 ? (hole.gir ? '&#x2713;' : '&#x2717;') : '');
        var classes = (hole.par !== 3 ? (hole.gir ? 'green' : 'red') : '');

        rows.imgNodes.push(<td key={idx}><div className="hole" style={style}></div></td>);
        rows.holeNodes.push(<td key={idx}>{hole.number}</td>);
        rows.distNodes.push(<td key={idx}>{hole[this_.props.round.tees]}</td>);
        rows.parNodes.push(<td key={idx}>{hole.par}</td>);
        rows.scoreNodes.push(<td key={idx}>{hole.score}</td>);
        rows.girNodes.push(<td className={classes} key={idx} dangerouslySetInnerHTML={{__html: gir}} />);
        rows.puttNodes.push(<td key={idx}>{hole.putts}</td>);
      });

      rows.imgNodes.push(<td></td>);
      rows.holeNodes.push(<td>{side}</td>);
      rows.distNodes.push(<td>{sideDist}</td>);
      rows.parNodes.push(<td>{sidePar}</td>);
      rows.scoreNodes.push(<td>{sideScore}</td>);
      rows.girNodes.push(<td>{sideGir}</td>);
      rows.puttNodes.push(<td>{sidePutts}</td>);

      if (back) {
        totalScore = utils.sum(back, 'score');
        totalPar = utils.sum(back, 'par');
        totalPutts = utils.sum(back, 'putts');
        totalDist = utils.sum(back, this.props.round.tees);
        nonPar3 = back.filter(function(el) {
          return el.par !== 3;
        });
        totalGir = nonPar3.filter(function(el) {
          return el.gir;
        }).length + '/' + nonPar3.length;
        rows.imgNodes.push(<td></td>);
        rows.holeNodes.push(<td>Total</td>);
        rows.distNodes.push(<td>{totalDist}</td>);
        rows.parNodes.push(<td>{totalPar}</td>);
        rows.scoreNodes.push(<td>{totalScore}</td>);
        rows.girNodes.push(<td>{totalGir}</td>);
        rows.puttNodes.push(<td>{totalPutts}</td>);
      }
      return rows;
    }

    var frontNine = formatHoles.call(this, this.props.data.slice(0,9));
    var backNine = formatHoles.call(this, this.props.data.slice(9,18), this.props.data);

    var summary = {
      round: this.props.round,
      scores: this.props.data
    };
    
    return (
      <div>
        <table className="out">
          <tr>{frontNine.imgNodes}</tr>
          <tr className="grid">{frontNine.holeNodes}</tr>
          <tr className="grid">{frontNine.distNodes}</tr>
          <tr className="grid">{frontNine.parNodes}</tr>
          <tr className="grid">{frontNine.scoreNodes}</tr>
          <tr className="grid">{frontNine.girNodes}</tr>
          <tr className="grid">{frontNine.puttNodes}</tr>
        </table>
        <table className="in">
          <tr>{backNine.imgNodes}</tr>
          <tr className="grid">{backNine.holeNodes}</tr>
          <tr className="grid">{backNine.distNodes}</tr>
          <tr className="grid">{backNine.parNodes}</tr>
          <tr className="grid">{backNine.scoreNodes}</tr>
          <tr className="grid">{backNine.girNodes}</tr>
          <tr className="grid">{backNine.puttNodes}</tr>
        </table>
      </div>
    );
  }
});

React.render((
  <App/>),
  document.body
);