require('../stylesheets/font-awesome.min');
require('../stylesheets/style');
var React = require('react');
var comet = require('./comet');
var utils = require('./utils');
var emitter = require('./modules/emitter');

var HoleList = require('./modules/HoleList'); 
var HoleModal = require('./modules/HoleModal');
var RoundModal = require('./modules/RoundModal');
var Summary = require('./modules/Summary');
var CloseButton = require('./modules/CloseButton');

var App = React.createClass({
  componentDidMount: function() {
    var this_ = this;
    emitter.on('hole.select', function(data) {
      this_.setState({ modalData: data, modal: 'hole' });
    });
    emitter.on('round.select', function(data) {
      this_.setState({ round: data });
    });
    emitter.on('round.new', function(data) {
      this_.setState({ modal: 'round' });
    });
  },
  closeModal: function() {
    this.setState({ modalData: null, modal: null });
  },
  getInitialState: function() {
    return { round: {} };
  },
  render: function() {
    return (
      <div className="app">
        <div className="content-block">
          <Rounds />
        </div>
        <div className="content-block">
          { this.state.round.id ? <Scorecard round={this.state.round} /> : null }
        </div>
        { this.state.modal === 'hole' ? <HoleModal data={this.state.modalData} close={this.closeModal} /> : null }
        { this.state.modal === 'round' ? <RoundModal close={this.closeModal} /> : null }
      </div>
    );
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
        <Summary rounds={this.state.data} options={{}} index={true} />
        <RoundList data={this.state.data} />
      </div>
    );
  }
});

var RoundList = React.createClass({
  addRound: function() {
    emitter.emit('round.new', {});
  },
  render: function() {
    var roundNodes = this.props.data.map(function(round, idx) {
      return (
        <Round round={round} key={idx} />
      );
    });
    return (
      <div className="round-list">
        <div className="round-actions">
          <span className="small btn" onClick={this.addRound}>add round</span>
        </div>
        {roundNodes}
      </div>);
  }
});

var Arrow = React.createClass({
  render: function() {
    var classes = 'arrow-' + this.props.dir;
    return (
      <div className={classes}>
        <div />
      </div>
    );
  }
});

var Round = React.createClass({
  componentDidMount: function() {
    emitter.on('round.select', function(round) {
      this.setState({ selectedRound: round });
    }.bind(this));
  },
  select: function() {
    emitter.emit('round.select', this.props.round);
  },
  getInitialState: function() {
    return { selectedRound: {} };
  },
  render: function() {
    var map = '/images/course_layout/' + this.props.round.course_id + '.png';
    var toPar = this.props.round.total_score - this.props.round.total_par;
    var overUnder = (toPar > 0) ? 'over' : 'under'; 
    var selected = this.props.round.id === this.state.selectedRound.id;
    var classes = 'round ' + (selected ? 'selected' : '');
    return (
      <div className={classes} onClick={this.select}>
        <div className="middle">
          <img src={map} height="60" />
        </div>
        <div className="middle round-info">
          {this.props.round.name} <span className="small">#{this.props.round.round_number}</span>
          <div className="small">{this.props.round.date_str}</div>
          <div className="small">Par {this.props.round.total_par}</div>
          <div className="small caps">{this.props.round.tees} {this.props.round[this.props.round.tees + '_dist']} yds</div>
          <div className="small">{toPar} {overUnder}</div>
        </div>
      </div>
    );
  }
});

var Scorecard = React.createClass({
  close: function() {
    emitter.emit('round.select', {});
  },
  componentDidMount: function() {
    this.loadScores(this.props);
  },
  loadScores: function(props) {
    comet.api.scores({ round_id: props.round.id }, function(data) {
      this.setState({ data: data });
    }.bind(this));
  },
  componentWillReceiveProps: function(props) {
    this.loadScores(props);
  },
  getInitialState: function() {
    return { data: [] };
  },
  render: function() {
    var options = {
      round_id: this.props.round.id
    };
    return (
      <div>
        <CloseButton action={this.close} />
        <HoleList round={this.props.round} data={this.state.data} />
        <Summary rounds={[this.props.round]} options={options} />
      </div>
    );
  }
});

React.render((
  <App/>),
  document.body
);



