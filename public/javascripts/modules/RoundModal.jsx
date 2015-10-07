var React = require('react');
var _ = require('lodash');
var comet = require('../comet');
var emitter = require('./emitter');

module.exports = React.createClass({
  componentDidMount: function() {
    var this_ = this;
    comet.api.courses(function(data) {
      this_.setState({ courses: data, courseId: data[0].id, tees: 'pros' });
    });
  },
  setValue: function(hole, key) {
    var this_ = this;
    var idx = hole.number - 1;
    return function(evt) {
      var state = {
        scores: this_.state.scores || []
      };
      state.scores[idx] = this_.state.scores[idx] || {};
      state.scores[idx][key] = +evt.target.value;
      state.scores[idx].hole_id = hole.id;
      this_.setState(state, function() {
        console.log(this.state);
      });
    };
  },
  setCourse: function(evt) {
    var this_ = this;
    this.setState({ courseId: evt.target.value });
    comet.api.holes({ course_id: +evt.target.value }, function(data) {
      this_.setState({ holes: data });
    });
  },
  setTees: function(evt) {
    this.setState({ tees: evt.target.value });
  },
  submit: function() {
    comet.api.saveRound(this.state, function(data) {
      this.props.close();
    }.bind(this));
  },
  prevent: function(event) {
    event.stopPropagation();
  },
  getInitialState: function() {
    return { courses: [], course: {}, scores: [], holes: [] };
  },
  render: function() {
    var courseOptions = this.state.courses.map(function(course) {
      return (
        <option value={course.id}>{course.name}</option>
      );
    });
    courseOptions.unshift(<option value="0">course</option>);
    var cols = this.state.holes.map(function(hole, idx) {
      var i = idx + 1;
      return (
        <div className="middle">
          <div className="center">{i}</div>
          <input type="text" tabIndex={i} onChange={this.setValue(hole, 'score')} />
          <input type="text" tabIndex={i+18} onChange={this.setValue(hole, 'fir')} />
          <input type="text" tabIndex={i+36} onChange={this.setValue(hole, 'gir')} />
          <input type="text" tabIndex={i+54} onChange={this.setValue(hole, 'putts')} />
        </div>
      );
    }.bind(this));
    return (
      <div className="modal" onClick={this.props.close}>
        <div className="dialog wide" onClick={this.prevent}>
          <div>
            <select onChange={this.setCourse}>
              {courseOptions}
            </select>
            <select onChange={this.setTees}>
              <option value="pros">Pros</option>
              <option value="tips">Tips</option>
            </select>
          </div>
          { this.state.holes.length ? <div className="table-wrapper">
            <div className="middle">
              <div>Hole</div>
              <div>Score</div>
              <div>FIR</div>
              <div>GIR</div>
              <div>Putts</div>
            </div>
            {cols}
          </div> : null }
          <div className="modal-submit">
            <span className="btn" onClick={this.submit}>submit</span>
          </div>
        </div>
      </div>
    );
  }
});