"use strict";

var React = require('react');

// Srt = screen reader text.
//
// In other words, this is content that should be spoken by voice control apps
// for the visually impaired. I'm probably not going to do a great job testing
// this but at least it's here.
//
// Original use case: add spaces between <Icon/>s. The icons have built-in alt
// text for screen readers when used in a standalone way, but without putting
// spaces in between, you'd end up with "Previous TrackPauseNext Track".

var Srt = React.createClass({
  propTypes: {
    text: React.PropTypes.string.isRequired
  },

  render: function() {
    return <span className="screen-reader-text">{this.props.text}</span>;
  }
});

module.exports = Srt;
