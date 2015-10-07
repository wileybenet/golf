var React = require('react');
var paper = require('paper');
var comet = require('../comet');
var uid = 0;

module.exports = React.createClass({
  componentDidMount: function() {
    this._imgId = 'modal-hole-img-' + uid;
    this._canvasId = 'modal-hole-canvas-' + uid;
    this.setupHole();
    uid++;
  },
  setupHole: function() {
    var canvas = document.getElementById(this._canvasId);

    this._scope = new paper.PaperScope().setup(canvas);

    var raster = new this._scope.Raster(this._imgId);
    raster.position = this._scope.view.center;
    raster.scale(0.5);

    this._scope.view.draw();
  },
  drawShots: function(shots) {
    var this_ = this;
    comet.api.shots({ score_id: this.props.data.hole.id }, function(shots) {
      var path = new this_._scope.Path({
        strokeColor: '#F00'
      });
      shots = shots.map(function(shot, idx) {
        path.lineTo(new this_._scope.Point(shot.x, shot.y));
        return new this_._scope.Shape.Circle({
          center: [shot.x, shot.y],
          radius: 3,
          fillColor: '#F00'
        });
      });

      shots.push(path);

      this_._shotLayer = new this_._scope.Layer(shots);

      this_._scope.view.draw();
    });
  },
  render: function() {
    return (
      <img className="hidden" id={this._imgId} src={img} />
      <canvas id={this._canvasId} height="350" width="250" />
    );
  }
});