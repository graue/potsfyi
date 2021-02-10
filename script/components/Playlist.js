"use strict";

import {
  playTrack,
  removeFromPlaylist,
  reorderPlaylist,
} from '../actions/ActionCreators';
import PlaylistItem from './PlaylistItem';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import $ from '../lib/jquery.shim';

import './Playlist.css';

function mapStateToProps(state) {
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

function mapDispatchToProps(dispatch) {
  return {
    onReorderTrack(fromIndex, toIndex) {
      dispatch(reorderPlaylist(fromIndex, toIndex));
    },
    onTrackPlay(index) {
      dispatch(playTrack(index));
    },
    onTrackRemove(index) {
      dispatch(removeFromPlaylist(index));
    },
  };
}

class Playlist extends Component {
  constructor(props) {
    super(props);
    this.state = {draggingIndex: null};
  }

  componentDidMount() {
    this._makeSortable();
  }

  componentWillUnmount() {
    this._teardownSortable();
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
          onClick={this.props.onTrackPlay.bind(null, index)}
          onRemoveClick={this.props.onTrackRemove.bind(null, index)}
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
