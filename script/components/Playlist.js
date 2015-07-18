"use strict";

import PlayStatusStore from '../stores/PlayStatusStore';
import PlaylistActionCreators from '../actions/PlaylistActionCreators';
import PlaylistItem from './PlaylistItem';
import React from 'react';
import TrackStore from '../stores/TrackStore';
import $ from '../lib/jquery.shim';

function getStateFromStores() {
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

const Playlist = React.createClass({
  getInitialState() {
    return getStateFromStores();
  },

  componentDidMount() {
    PlayStatusStore.addChangeListener(this.handleChange);
    TrackStore.addChangeListener(this.handleChange);
    this.makeSortable();
  },

  componentWillUnmount() {
    PlayStatusStore.removeChangeListener(this.handleChange);
    TrackStore.removeChangeListener(this.handleChange);
    this.teardownSortable();
  },

  // TODO: Do we need makeSortable/teardownSortable on DidUpdate and
  // WillUpdate? Delete this comment if you determine that we don't.

  handleChange() {
    this.setState(getStateFromStores());
  },

  makeSortable() {
    const rootNode = React.findDOMNode(this.refs.itemList);
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
  },

  teardownSortable() {
    const rootNode = React.findDOMNode(this.refs.itemList);
    $(rootNode).sortable('destroy');
  },

  render() {
    const tracks = this.state.tracks;

    // FIXME: Probably don't really want this goofy message. Maybe show
    // browse/discovery content instead eventually.
    const emptyMsg = (
      <p className="PlaylistEmptyMessage">
        Nothing in playlist yet. Queue up some tunes!
      </p>
    );

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
        {tracks.length < 1 && emptyMsg}
        <ul className="PlaylistItems" ref="itemList">
          {items}
        </ul>
      </div>
    );
  },
});

export default Playlist;
