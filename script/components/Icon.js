"use strict";
// @flow

import PropTypes from 'prop-types';
import React from 'react';
import Srt from './Srt';
import keyMirror from 'keymirror';

// Webfont-based icons that are intended to be reasonably accessible to
// screen reader users, inspired by the suggestions at:
// http://css-tricks.com/html-for-icon-font-usage/

// TODO: auto-convert the Zurb icon font's foundation-icons.css to get all of
// the names in here.
//
// In the meantime, just a few icons we plan to use are here.
const NAME_TO_CHARCODE: {[key: string]: number} = {
  LIST: 0xf169,
  X: 0xf217,
  PLUS: 0xf199,
  PLAY: 0xf198,
  PAUSE: 0xf191,
  NEXT: 0xf17c,
  PREVIOUS: 0xf19c,
  MAGNIFYING_GLASS: 0xf16c,
};

const ICON_NAMES = keyMirror(NAME_TO_CHARCODE);

class Icon extends React.Component {
  static NAMES = ICON_NAMES;
  static propTypes = {
    alt: PropTypes.string,  // Alt text for a11y. Should be present if
                            // icon is used standalone.
    className: PropTypes.string,
    name: PropTypes.oneOf(Object.keys(ICON_NAMES)).isRequired,
    onClick: PropTypes.func,
  };

  props: {
    alt?: ?string,
    className?: ?string,
    name: string,
    onClick?: ?(e: SyntheticMouseEvent) => mixed,
  };

  render() {
    const character = String.fromCharCode(NAME_TO_CHARCODE[this.props.name]);
    const iconSpan = <span aria-hidden="true" data-icon={character} />;
    let classes = this.props.className || '';

    let possibleAltText = '';
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
}

export default Icon;
