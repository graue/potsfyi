"use strict";

var MainContentContainer = require('./MainContentContainer');
var Player = require('./Player');
var React = require('react');
var UIBar = require('./UIBar');

// Stores:
//
//   PlayStatusStore: the playlist, whether you're playing and if so which
//     index into the playlist you're playing, how far into that track (to
//     the nearest second), and whether the track is paused.
//   TrackStore: mapping from track IDs (we'll call them strings, even tho
//     they are probably strings of numbers like '1', '2', '319'...) to
//     metadata (title, artist, tracknumber (integer), album ID or undefined
//     if not on an album). OUTSIDE of this store, every reference to a track
//     is to an ID only and holds no metadata.
//   AlbumStore: mapping from album IDs (like track IDs, above) to metadata
//     (title, artist, release date, genre, tracks (list of track IDs in order).
//     As above, OUTSIDE of this store, every reference to an album is to an
//     ID only and holds no metadata.
//   SearchStore: the query that has been sent or is being sent to the server;
//     the results, if any have come back, plus the query that those results
//     were for (can be stale).
//
// Components, annotated with stores each controller-view relies on:
//
// > PlayStatusStore
// & TrackStore
// # AlbumStore
// ? SearchStore
//
//   UIBar
//     Nav >
//     SearchArea
//       SearchBox ?
//         SearchResultsDropdown ?&#
//           SearchResultItem
//     DropdownMenu
//   MainContentContainer
//     CoverArt >&#
//     PlaylistArea
//       Playlist >&
//         PlaylistTrack
//           RemoveLink
//   Player >&
//

var App = React.createClass({
  render: function() {
    return (
      <div id="app">
        <UIBar />
        <MainContentContainer />
        <Player />
      </div>
    );
  }
});

module.exports = App;
