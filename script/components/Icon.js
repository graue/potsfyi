"use strict";

var React = require('react');
var Srt = require('./Srt');
var keyMirror = require('react/lib/keyMirror');

// Webfont-based icons that are intended to be reasonably accessible to
// screen reader users, inspired by the suggestions at:
// http://css-tricks.com/html-for-icon-font-usage/

// TODO: auto-convert the Zurb icon font's foundation-icons.css to get all of
// the names in here.
//
// In the meantime, just a few icons we plan to use are here.
var NAME_TO_CHARCODE = {
  LIST: 0xf169,
  X: 0xf217,
  PLUS: 0xf199,
  PLAY: 0xf198,
  PAUSE: 0xf191,
  NEXT: 0xf17c,
  PREVIOUS: 0xf19c,
  MAGNIFYING_GLASS: 0xf16c,
};

var ICON_NAMES = keyMirror(NAME_TO_CHARCODE);

var Icon = React.createClass({
  propTypes: {
    alt: React.PropTypes.string,  // Alt text for a11y. Should be present if
                                  // icon is used standalone.
    className: React.PropTypes.string,
    name: React.PropTypes.oneOf(Object.keys(ICON_NAMES)).isRequired,
    onClick: React.PropTypes.func,
  },

  render: function() {
    // TODO: Double-check this logic to make sure I didn't fuck it up when
    // adding className. Once you have checked and are confident of the
    // absence of a fuck-up, delete this comment.

    var character = String.fromCharCode(NAME_TO_CHARCODE[this.props.name]);
    var classes = this.props.className || '';
    var iconSpan = <span aria-hidden="true" data-icon={character} />;

    var possibleAltText = '';
    if (this.props.alt) {
      possibleAltText = <Srt text={this.props.alt} />;
    } else {
      classes += (classes.length > 0 ? ' ' : '') + 'icon-standalone';
    }

    return (
      <span className={classes} onClick={this.props.onClick}>
        <span aria-hidden="true" data-icon={character} />
        {possibleAltText}
      </span>
    );
  }
});

Icon.NAMES = ICON_NAMES;

module.exports = Icon;
