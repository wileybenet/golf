var React = require('react');
var emitter = require('./emitter');

module.exports = React.createClass({
  render: function() {
    var style = {
      backgroundImage: 'url(images/holes/' + this.props.data.round.course_id + '-' + this.props.data.hole.number + '.png)'
    };
    var gir = this.props.data.hole.gir ? '<i class="fa fa-circle"></i>' : '<i class="fa fa-circle-o"></i>';
    var fir = (this.props.data.hole.par !== 3 ? (this.props.data.hole.fir ? '<i class="fa fa-circle"></i>' : '<i class="fa fa-circle-o"></i>') : '&nbsp;');

    return (
      <div className="modal">
        <div className="dialog">
          <div>
            <div className="hole-map" style={style}></div>
          </div>
          <div className="info">
            <div>{this.props.data.hole.number}</div>
            <div>{this.props.data.hole[this.props.data.round.tees]}</div>
            <div>{this.props.data.hole.par}</div>
            <div className={'over-under over-under-' + this.props.data.hole.over_under}>{this.props.data.hole.score}</div>
            <div dangerouslySetInnerHTML={{__html: fir}} />
            <div dangerouslySetInnerHTML={{__html: gir}} />
            <div>{this.props.data.hole.putts}</div>
          </div>
        </div>
      </div>
    );
  }
});