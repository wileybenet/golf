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
        <div className="top">
          <Rounds onSelect={this.selectRound} />
        </div>
        <div className="top">
          { this.state.round.id ? <Scorecard round={this.state.round} /> : null }
        </div>
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
  componentWillReceiveProps: function(props) {
    if (!this.$once) {
      this.props.onSelect(props.data[0]);
      this.$once = true;
    }
  },
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
          <div className="small">Par {this.props.round.total_par}</div>
          <div className="small caps">{this.props.round.tees} {this.props.round[this.props.round.tees + '_dist']} yds</div>
          <div className="small">{toPar} {overUnder}</div>
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
    var handicap = utils.sum(handicaps, 'handicap') / handicaps.length;
    var handicapIndex;
    (handicap * 0.96).toFixed(10).replace(/^[^.]+\../, function(match) {
      handicapIndex = match;
    });
    return (
      <div className="summary">
        <div>Handicap {handicapIndex}</div>
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
        gir: nonPar3.filter(function(el) {
          return el.gir;
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
      </div>
    );
  }
});

var Hole = React.createClass({
  toggle: function() {
    this.setState({ toggle: !this.state.toggle });
  },
  getInitialState: function() {
    return { toggle: false };
  },
  render: function() {
    var style = {
      backgroundImage: 'url(images/holes/' + this.props.data.course_id + '-' + this.props.data.number + '.png)'
    };
    var gir = (this.props.data.par !== 3 ? (this.props.data.gir ? '&#x2713;' : '&#x2717;') : '&nbsp;');
    var overUnder = 'over-under-' + (this.props.data.score - this.props.data.par);
    var focused = this.state.toggle ? 'focus' : 'unfocus';

    if (!this.props.data.id) {
      gir = this.props.data.gir || '&nbsp;';
      overUnder = null;
    }

    return (
      <div style={ { textAlign: this.props.data.align || 'center' } } onClick={this.toggle}>
        <div className={focused}>
          <div className="hole-map" style={this.props.data.id ? style : null}></div>
        </div>
        <div className={this.state.toggle ? 'focus-info' : 'unfocus-info'}>
          <div>{this.props.data.number}</div>
          <div>{this.props.data[this.props.round.tees]}</div>
          <div>{this.props.data.par}</div>
          <div className={overUnder}>{this.props.data.score}</div>
          <div dangerouslySetInnerHTML={{__html: gir}} />
          <div>{this.props.data.putts}</div>
        </div>
      </div>
    );
  }
});

React.render((
  <App/>),
  document.body
);



