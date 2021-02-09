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

  constructor(props: PlaylistProps) {
    super(props);
    this.state = {draggingIndex: null};
  }

  componentDidMount() {
    this._makeSortable();
  }

  componentWillUnmount() {
    this._teardownSortable();
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

  _makeSortable() {
    const rootNode = ReactDOM.findDOMNode(this.refs.itemList);
    $(rootNode).disableSelection().sortable({
      distance: 10,
      start: (event, ui) => {
        this.setState({draggingIndex: ui.item.index()});
      },
      stop: (event, ui) => {
        const fromIndex = this.state.draggingIndex;
        const toIndex = ui.item.index();

        // Prevent jQuery UI from actually moving the element,
        // which would confuse React.
        $(rootNode).sortable('cancel');

        this.setState({draggingIndex: null});
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
          isDragging={this.state.draggingIndex === index}
          isPlaying={isPlaying}
          key={track.key}
          onClick={this._handleTrackClick.bind(this, index)}
          onRemoveClick={this._handleTrackRemoveClick.bind(this, index)}
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
