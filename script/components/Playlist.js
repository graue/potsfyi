"use strict";
// @flow weak

import PlayStatusStore from '../stores/PlayStatusStore';
import PlaylistActionCreators from '../actions/PlaylistActionCreators';
import PlaylistItem from './PlaylistItem';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import TrackStore from '../stores/TrackStore';
import $ from '../lib/jquery.shim';

import './Playlist.css';

type PlaylistState = {
  playingIndex: number,
  tracks: Array<{
    id: string,
    key: string,
    // TODO add other track fields
  }>,
};

function getStateFromStores(): PlaylistState {
  return {
    playingIndex: PlayStatusStore.getPlayingIndex(),
    tracks: PlayStatusStore.getTracksWithKeys().map(([trackId, key]) => {
      return {
        id: trackId,
        key,
        ...TrackStore.getTrack(trackId)
      };
    }),
  };
}

class Playlist extends Component {
  state: PlaylistState;

  constructor(props) {
    super(props);
    this.state = getStateFromStores();
  }

  componentDidMount() {
    PlayStatusStore.addChangeListener(this._handleChange);
    TrackStore.addChangeListener(this._handleChange);
    this._makeSortable();
  }

  componentWillUnmount() {
    PlayStatusStore.removeChangeListener(this._handleChange);
    TrackStore.removeChangeListener(this._handleChange);
    this._teardownSortable();
  }

  // TODO: Do we need makeSortable/teardownSortable on DidUpdate and
  // WillUpdate? Delete this comment if you determine that we don't.

  _handleChange = () => {
    this.setState(getStateFromStores());
  };

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

        // Instead, fire an action and we'll eventually end up rerendering.
        PlaylistActionCreators.reorderPlaylist(fromIndex, toIndex);
      },
    });
  }

  _teardownSortable() {
    const rootNode = ReactDOM.findDOMNode(this.refs.itemList);
    $(rootNode).sortable('destroy');
  }

  render(): React.Element<any> {
    const tracks = this.state.tracks;

    const items = tracks.map((track, index) => {
      const isPlaying = index === this.state.playingIndex;
      return (
        <PlaylistItem
          track={track}
          key={track.key}
          isPlaying={isPlaying}
          sortIndex={index}
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

export default Playlist;
