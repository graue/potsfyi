"use strict";
// @flow

import {
  playTrack,
  removeFromPlaylist,
  reorderPlaylist,
} from '../actions/ActionCreators';
import PlaylistItem from './PlaylistItem';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import type {ReduxState} from '../stores/store';
import $ from '../lib/jquery.shim';

import './Playlist.css';

type PlaylistProps = {
  onReorderTrack: (
    fromIndex: number,
    toIndex: number
  ) => mixed,
  onTrackPlay: (index: number) => mixed,
  onTrackRemove: (index: number) => mixed,
  playingIndex: number,
  tracks: Array<{
    id: string,
    key: string,
    // TODO convert to object spread type after updating
    // ...Track,
    albumId: ?string,
    artist: string,
    title: string,
    trackNumber: ?number,
  }>,
};
type PlaylistState = void;

function mapStateToProps(state: ReduxState) {
  return {
    playingIndex: state.playStatus.playingIndex,
    tracks: state.playStatus.playlist.map(([trackId, nonce]) => {
      const track = state.trackCache.cache[trackId];
      return {
        id: trackId,
        key: nonce,
        ...track,
      };
    }),
  };
}

function mapDispatchToProps(
  dispatch: Function  // FIXME
) {
  return {
    onReorderTrack(
      fromIndex: number,
      toIndex: number
    ) {
      dispatch(reorderPlaylist(fromIndex, toIndex));
    },
    onTrackPlay(index: number) {
      dispatch(playTrack(index));
    },
    onTrackRemove(index: number) {
      dispatch(removeFromPlaylist(index));
    },
  };
}

class Playlist extends Component {
  props: PlaylistProps;
  state: PlaylistState;
  _boundOnClicks: Array<(e: SyntheticMouseEvent) => mixed>;
  _boundOnRemoveClicks: Array<(e: SyntheticMouseEvent) => mixed>;

  constructor(props: PlaylistProps) {
    super(props);
    this._bindHandlers(props);
  }

  componentDidMount() {
    this._makeSortable();
  }

  componentWillReceiveProps(nextProps: PlaylistProps) {
    this._bindHandlers(nextProps);
  }

  componentWillUnmount() {
    this._teardownSortable();
  }

  _bindHandlers(props: PlaylistProps) {
    this._boundOnClicks = props.tracks.map(
      (track, index) => this._handleTrackClick.bind(this, index)
    );
    this._boundOnRemoveClicks = props.tracks.map(
      (track, index) => this._handleTrackRemoveClick.bind(this, index)
    );
  }

  _handleTrackClick = (
    index: number,
    e: SyntheticMouseEvent
  ) => {
    this.props.onTrackPlay(index);
  }

  _handleTrackRemoveClick = (
    index: number,
    e: SyntheticMouseEvent
  ) => {
    this.props.onTrackRemove(index);
  }

  // TODO: Do we need makeSortable/teardownSortable on DidUpdate and
  // WillUpdate? Delete this comment if you determine that we don't.

  _makeSortable() {
    const rootNode = ReactDOM.findDOMNode(this.refs.itemList);
    $(rootNode).disableSelection().sortable({
      distance: 10,
      stop: (event, ui) => {
        // jQuery UI doesn't give us the old (pre-drag) index,
        // so use the data-idx attribute (which was set via the
        // PlaylistItemView's sortIndex prop).
        const fromIndex = ui.item.attr('data-idx') | 0;
        const toIndex = ui.item.index();

        // Prevent jQuery UI from actually moving the element,
        // which would confuse React.
        $(rootNode).sortable('cancel');

        // Instead, call a callback and we'll eventually end up rerendering.
        this.props.onReorderTrack(fromIndex, toIndex);
      },
    });
  }

  _teardownSortable() {
    const rootNode = ReactDOM.findDOMNode(this.refs.itemList);
    $(rootNode).sortable('destroy');
  }

  render() {
    const tracks = this.props.tracks;

    const items = tracks.map((track, index) => {
      const isPlaying = index === this.props.playingIndex;
      return (
        <PlaylistItem
          isPlaying={isPlaying}
          key={track.key}
          onClick={this._boundOnClicks[index]}
          onRemoveClick={this._boundOnRemoveClicks[index]}
          sortIndex={index}
          track={track}
        />
      );
    });

    return (
      <div className="Playlist">
        <ul className="Playlist_Items" ref="itemList">
          {items}
        </ul>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Playlist);
