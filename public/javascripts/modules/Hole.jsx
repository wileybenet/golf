var React = require('react');
var emitter = require('./emitter');

module.exports = React.createClass({
  componentDidMount: function() {
    var this_ = this;
    emitter.on('hole.select', function(data) {
      if (data.id !== this_.props.data.id && this_.state.toggle) {
        this_.setState({ toggle: false });
      }
    });
  },
  open: function() {
    emitter.emit('hole.select', {
      hole: this.props.data,
      round: this.props.round
    });
  },
  getInitialState: function() {
    return { toggle: false };
  },
  render: function() {
    var src = 'images/holes/' + this.props.data.course_id + '-' + this.props.data.number + '.png';
    var gir = this.props.data.gir ? '<i class="fa fa-circle"></i>' : '<i class="fa fa-circle-o"></i>';
    var fir = (this.props.data.par !== 3 ? (this.props.data.fir ? '<i class="fa fa-circle"></i>' : '<i class="fa fa-circle-o"></i>') : '&nbsp;');
    var overUnder = 'over-under over-under-' + (this.props.data.score - this.props.data.par);

    if (!this.props.data.id) {
      fir = this.props.data.fir || '&nbsp;';
      gir = this.props.data.gir || '&nbsp;';
      overUnder = null;
    }

    return (
      <div className={this.props.data.id ? 'hole-data' : 'hole-summary'} style={ { textAlign: this.props.data.align || 'center' } } onClick={this.props.data.id && this.open}>
        {this.props.data.id ? <img className="hole-map" src={src} /> : <div className="hole-map" /> }
        <div className="info">
          <div>{this.props.data.number}</div>
          <div>{this.props.data[this.props.round.tees]}</div>
          <div>{this.props.data.par}</div>
          <div dangerouslySetInnerHTML={{__html: fir}} />
          <div dangerouslySetInnerHTML={{__html: gir}} />
          <div>{this.props.data.putts}</div>
          <div className={overUnder}>{this.props.data.score}</div>
        </div>
      </div>
    );
  }
});