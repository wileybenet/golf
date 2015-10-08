var React = require('react');
var paper = require('paper');
var paperColors = require('../paper.colors.js');
var comet = require('../comet');
var emitter = require('./emitter');
var CloseButton = require('./CloseButton');
var $ = require('$');

module.exports = React.createClass({
  edit: function() {
    var idx = 0;
    var path = new this._scope.Path({
      strokeColor: '#F00'
    });

    this.setState({ editing: true });
    this.wipeCanvas();

    this._shotString = [];
    this._editLayer = new this._scope.Layer([path]);

    this._tool = new paper.Tool();
    this._tool.onMouseDown = function(event) {
      var x = event.event.layerX;
      var y = event.event.layerY;

      this._editLayer.addChild(new this._scope.Shape.Circle({
        center: [x, y],
        radius: 3,
        fillColor: '#F00'
      }));
      path.lineTo(new this._scope.Point(x, y));
      this._shotString.push({
        score_id: this.props.data.hole.score_id,
        number: idx,
        x: x,
        y: y
      });
      idx++;
      this._scope.view.draw();
    }.bind(this);
  },
  save: function() {
    var this_ = this;
    comet.api.saveShots({ shots: this._shotString }, function() {
      this.setState({ editing: false });
      this.drawCanvas();
    }.bind(this));
  },
  cancel: function() {
    this._shotString = null;
    this.setState({ editing: false });
    this.drawCanvas();
  },
  drawShots: function(shotGroups) {
    var draw = function(shots, color, width1, width2, roundIdx, background) {
      var path = new this._scope.Path({
        strokeColor: color,
        strokeWidth: width1,
        strokeJoin: 'round'
      });
      var paths = [];
      shots.forEach(function(shot, idx) {
        var widthCalc = width1 / 2;
        var pointB = new this._scope.Point(shot.x, shot.y);
        path.lineTo(pointB);
        if (idx > 0 && shots.length > 1) {
          widthCalc = width2;
        }
        paths.push(new this._scope.Shape.Circle({
          center: [shot.x, shot.y],
          radius: widthCalc,
          fillColor: color
        }));

        if (this.state.view === 'DRIVES' && idx === 1 && background) {
          var offset = (roundIdx % 2) ? 60 : 200;
          var pointA = new this._scope.Point(shots[0].x, shots[0].y);
          var text = new this._scope.PointText(new this._scope.Point(offset, shot.y + 3));
          text.fillColor = 'black';
          text.justification = (roundIdx % 2) ? 'right' : 'left';
          text.content = (pointA.getDistance(pointB) * this.props.data.hole.scale_factor).toFixed(0) + ' yds';
          paths.push(text);

          var context = new this._scope.Path({
            strokeColor: 'rgba(0,0,0,0.5)',
            strokeWidth: 1
          });
          context.lineTo(pointB);
          context.lineTo(new this._scope.Point(offset + ((roundIdx % 2) ? 10 : -10), shot.y));
          paths.push(context);
        }
      }.bind(this));

      paths.push(path);

      return paths;
    }.bind(this);

    var idx = 0;
    var backPaths = [];
    var frontPaths = [];

    if (this._shotLayer)
      this._shotLayer.remove();

    this._shotLayer = new this._scope.Layer();
    _.each(shotGroups, function(group, id) {
      backPaths = backPaths.concat(draw(group, '#333', 4, 4, idx, true));
      frontPaths = frontPaths.concat(draw(group, paperColors[idx], 1, 2.5, idx));
      idx++;
    }.bind(this));

    this._shotLayer.addChildren(backPaths);
    this._shotLayer.addChildren(frontPaths);

    this._scope.view.draw();
  },
  getShots: function(callback) {
    var options;
    switch (this.state.view) {
      case 'CURRENT_HOLE':
        options = { score_id: this.props.data.hole.score_id };
        break;
      case 'DRIVES':
        options = { hole_id: this.props.data.hole.id, number: [0, 1] };
        break;
      case '2ND_SHOT':
        options = { hole_id: this.props.data.hole.id, number: [1, 2] };
        break;
      case 'ALL_HOLES':
        options = { course_id: this.props.data.round.course_id, hole_id: this.props.data.hole.id };
    }
    comet.api.shots(options, callback);
  },
  wipeCanvas: function() {
    this._shotLayer.remove();
  },
  drawCanvas: function() {
    if (this._tool)
      this._tool.remove();
    if (this._editLayer)
      this._editLayer.remove();

    this._scope.view.draw();

    this.getShots(this.drawShots);
  },
  initCanvas: function() {
    var canvas = document.getElementById('modal-hole-canvas');

    this._scope = new paper.PaperScope();
    this._scope.setup(canvas);

    var raster = new this._scope.Raster('modal-hole-img');
    raster.position = this._scope.view.center;
    raster.scale(0.5);

    this._scope.view.draw();
  },
  updateView: function(evt) {
    this.setState({ view: evt.target.value }, this.drawCanvas);
  },
  componentWillReceiveProps: function(props) {
    this.$newHole = true;
    this.setState({ editing: false });
  },
  componentDidMount: function() {
    var this_ = this;

    $(window).on('keyup', function(evt) {
      if (evt.keyCode === 37) {
        this_.prevHole();
      } else if (evt.keyCode === 39) {
        this_.nextHole();
      }
    });

    this.initCanvas();
    setTimeout(function() {
      this.drawCanvas();
    }.bind(this));
  },
  componentDidUpdate: function() {
    if (this.$newHole) {
      this.drawCanvas();
      this.$newHole = null;
    }
  },
  componentWillUnmount: function() {
    if (this._tool)
      this._tool.remove();
    this._scope.remove();
    $(window).off('keyup');
  },
  nextHole: function() {
    emitter.emit('hole.next', this.props.data.hole);
  },
  prevHole: function() {
    emitter.emit('hole.prev', this.props.data.hole);
  },
  prevent: function(event) {
    event.stopPropagation();
  },
  getInitialState: function() {
    return { view: 'CURRENT_HOLE' };
  },
  render: function() {
    var this_ = this;

    var overUnder = ['Double Eagle', 'Eagle', 'Birdie', 'Par', 'Bogie', 'Double Bogie', 'Triple Bogie', 'Quadruple Bogie'];
    var img = 'images/holes/' + this.props.data.round.course_id + '-' + this.props.data.hole.number + '.png';
    var gir = this.props.data.hole.gir ? '<i class="fa fa-circle"></i>' : '<i class="fa fa-circle-o"></i>';
    var fir = (this.props.data.hole.par !== 3 ? (this.props.data.hole.fir ? '<i class="fa fa-circle"></i>' : '<i class="fa fa-circle-o"></i>') : '&nbsp;');

    // <ShotProfile data={this.props.data.hole.id} shots={'all'} />
    return (
      <div className="modal" onClick={this.props.close}>
        <div className="dialog" onClick={this.prevent}>
          <CloseButton action={this.props.close} />
          <div className="left-slide"><i className="fa fa-angle-left btn" onClick={this.prevHole}></i></div>
          <div className="right-slide"><i className="fa fa-angle-right btn" onClick={this.nextHole}></i></div>
          <div className="hole-focus">
            <table className="hole-info top small">
              <tr>
                <td colSpan="2">
                  <div>{this.props.data.round.name} round {this.props.data.round.round_number}</div>
                </td>
                <td></td>
              </tr>
              <tr>
                <td>
                  <div className="hole-number">
                    {this.props.data.hole.number}
                    <span className={'over-under inline over-under-' + this.props.data.hole.over_under}>{this.props.data.hole.score}</span>
                  </div>
                </td>
                <td></td>
              </tr>
              <tr>
                <td>Distance</td>
                <td>{this.props.data.hole[this.props.data.round.tees]} yds</td>
              </tr>
              <tr>
                <td>Par</td>
                <td>{this.props.data.hole.par}</td>
              </tr>
              <tr>
                <td>Score</td>
                <td>{overUnder[this.props.data.hole.over_under + 3]}</td>
              </tr>
              <tr>
                <td>Fairway in regulation</td> 
                <td><span dangerouslySetInnerHTML={{__html: fir}} /></td>
              </tr>
              <tr>
                <td>Green in regulation</td>
                <td><span dangerouslySetInnerHTML={{__html: gir}} /></td>
              </tr>
              <tr>
                <td>Putts</td>
                <td>{this.props.data.hole.putts}</td>
              </tr>
            </table>
            <div className="hole-map-wrapper top">
              <img className="hidden" id="modal-hole-img" src={img} width="260" />
              <canvas id="modal-hole-canvas" height="350" width="250" />
              { this.state.editing ? <div className="btn save small" onClick={this.save}>save</div> : <div className="btn edit small" onClick={this.edit}>edit</div> }
              { this.state.editing ? <div className="btn edit small" onClick={this.cancel}>cancel</div> : null }
              <div className="hole-options small">
                <div>
                  <label htmlFor="current-hole">Current</label>
                  <input name="view" id="current-hole" type="radio" value="CURRENT_HOLE" onChange={this.updateView} checked={this.state.view === 'CURRENT_HOLE'} /> 
                </div>
                <div>
                  <label htmlFor="drives">Drives</label>
                  <input name="view" id="drives" type="radio" value="DRIVES" onChange={this.updateView} checked={this.state.view === 'DRIVES'} /> 
                </div>
                <div>
                  <label htmlFor="nd-shot">2nd Shot</label>
                  <input name="view" id="nd-shot" type="radio" value="2ND_SHOT" onChange={this.updateView} checked={this.state.view === '2ND_SHOT'} /> 
                </div>
                <div>
                  <label htmlFor="all-holes">All</label>
                  <input name="view" id="all-holes" type="radio" value="ALL_HOLES" onChange={this.updateView} checked={this.state.view === 'ALL_HOLES'} /> 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});