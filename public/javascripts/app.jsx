require('../stylesheets/font-awesome.min');
require('../stylesheets/style');
var React = require('react');
var comet = require('./comet');
var utils = require('./utils');
var emitter = require('./modules/emitter');

var HoleModal = require('./modules/HoleModal');

var App = React.createClass({
  componentDidMount: function() {
    var this_ = this;
    emitter.on('hole.select', function(data) {
      this_.setState({ modalData: data });
    });
  },
  selectRound: function(round) {
    this.setState({ round: round });
  },
  getInitialState: function() {
    return { round: {}, modalData: null };
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
        { this.state.modalData ? <HoleModal data={this.state.modalData} /> : null }
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

var HoleList = require('./modules/HoleList'); 

React.render((
  <App/>),
  document.body
);



