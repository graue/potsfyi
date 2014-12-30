"use strict";

var AlbumStore = require('../stores/AlbumStore');
var React = require('react');
var SearchActionCreators = require('../actions/SearchActionCreators');
var SearchResultsDropdown = require('./SearchResultsDropdown');
var SearchStore = require('../stores/SearchStore');
var TrackStore = require('../stores/TrackStore');
var _ = require('underscore');

// Fetch metadata for a search result (album or track).
// Example:
// Input: {id: 32, isAlbum: false}
// Output: {id: 32, isAlbum: false, title: 'Get Lucky', artist: 'Daft Punk'}
function hydrate(item) {
  var fetcher = item.isAlbum ? AlbumStore.getAlbum : TrackStore.getTrack;
  return _.extend({}, item, fetcher(item.id));
}

function getStateFromStores() {
  var state = {
    query: SearchStore.getQuery(),
    results: SearchStore.getResults(),
  };

  // Fetch metadata for each item (track or album), so the dropdown can be
  // dumb and still display this.
  if (state.results && state.results.items) {
    state.results.items = state.results.items.map(hydrate);
  }

  return state;
}

var SearchBox = React.createClass({
  getInitialState: function() {
    var state = _.extend({}, getStateFromStores());

    // Transient query: whatever's actually in the textbox right now. The
    // 'query' value we put in an action and pull from the store is a
    // debounced version of this, so that as you're typing, you see the effect
    // of each keystroke immediately, but we limit actual AJAX requests.
    state.transientQuery = state.query || '';
    return state;
  },

  componentDidMount: function() {
    SearchStore.addChangeListener(this.handleChange);
  },

  componentWillUnmount: function() {
    SearchStore.removeChangeListener(this.handleChange);
  },

  handleChange: function() {
    this.setState(getStateFromStores());
  },

  focus: function() {
    var node = this.refs.input.getDOMNode();
    node.focus();
    node.select();
  },

  handleInput: function(event) {
    var query = event.target.value;
    this.setState({transientQuery: query});

    // TODO: Debounce this (except if query is '').
    SearchActionCreators.changeQuery(query);
  },

  render: function() {
    // TODO: 6to5
    // var {query, results} = this.state;
    var query = this.state.transientQuery;
    var results = this.state.results;

    // TODO: Also don't render dropdown if the hypothetical LayerStore(?) says
    // not to (in case user clicks elsewhere on the page and hides it).
    var shouldRenderDropdown =
      query !== '' && results && results.items.length > 0;

    // TODO: Maybe show in some way if the results are stale? Spinner?
    var maybeDropdown = shouldRenderDropdown ?
      <SearchResultsDropdown items={results.items} /> :
      null;

    return (
      <span className="SearchBox">
        <input
          className="SearchBoxInput"
          onChange={this.handleInput}
          ref="input"
          value={query}
        />
        {maybeDropdown}
      </span>
    );
  }
});

module.exports = SearchBox;
