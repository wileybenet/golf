var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (
      <div className="close" onClick={this.props.action}>
        &times;
      </div>
    );
  }
});