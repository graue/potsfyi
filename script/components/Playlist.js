"use strict";

var PlayStatusStore = require('../stores/PlayStatusStore');
var PlaylistActionCreators = require('../actions/PlaylistActionCreators');
var PlaylistItem = require('./PlaylistItem');
var React = require('react');
var TrackStore = require('../stores/TrackStore');
var _ = require('underscore');
var $ = require('../lib/jquery.shim');

function getStateFromStores() {
  var state = {
    playingIndex: PlayStatusStore.getPlayingIndex(),
    playlist: PlayStatusStore.getPlaylist().map(function(trackId) {
      return _.extend({id: trackId}, TrackStore.getTrack(trackId));
    }),
  };
  return state;
}

var Playlist = React.createClass({
  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function() {
    PlayStatusStore.addChangeListener(this.handleChange);
    TrackStore.addChangeListener(this.handleChange);
    this.makeSortable();
  },

  componentWillUnmount: function() {
    PlayStatusStore.removeChangeListener(this.handleChange);
    TrackStore.removeChangeListener(this.handleChange);
    this.teardownSortable();
  },

  // TODO: Do we need makeSortable/teardownSortable on DidUpdate and
  // WillUpdate? Delete this comment if you determine that we don't.

  handleChange: function() {
    this.setState(getStateFromStores());
  },

  makeSortable: function() {
    if (this.state.playlist.length < 1) {
      return;
    }
    var rootNode = this.refs.itemList.getDOMNode();
    $(rootNode).disableSelection().sortable({
      distance: 10,
      stop: function(event, ui) {
        // jQuery UI doesn't give us the old (pre-drag) index,
        // so use the data-idx attribute (which was set via the
        // PlaylistItemView's sortIndex prop).
        var fromIndex = ui.item.attr('data-idx') | 0;
        var toIndex = ui.item.index();

        // Prevent jQuery UI from actually moving the element,
        // which would confuse React.
        $(rootNode).sortable('cancel');

        // Instead, fire an action and we'll eventually end up rerendering.
        PlaylistActionCreators.reorderPlaylist(fromIndex, toIndex);
      }.bind(this)
    });
  },

  teardownSortable: function() {
    if (this.state.playlist.length < 1) {
      return;
    }
    var rootNode = this.refs.itemList.getDOMNode();
    $(rootNode).sortable('destroy');
  },

  render: function() {
    var items;

    var playlist = this.state.playlist;
    if (playlist.length < 1) {
      // FIXME: Probably don't really want this goofy message. Maybe show
      // browse/discovery content instead eventually.
      items = (
        <p className="PlaylistEmptyMessage">
          Nothing in playlist yet. Queue up some tunes!
        </p>
      );
    } else {
      var _this = this;
      items = playlist.map(function(track, index) {
        var isPlaying = index === _this.state.playingIndex;
        return (
          <PlaylistItem
            track={track}
            key={track.id}
            isPlaying={isPlaying}
            sortIndex={index}
          />
        );
      });
      items = <ul className="PlaylistItems" ref="itemList">{items}</ul>;
    }

    return (
      <div className="Playlist">
        {items}
      </div>
    );
  }
});

module.exports = Playlist;
