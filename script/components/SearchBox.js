"use strict";

var AlbumStore = require('../stores/AlbumStore');
var React = require('react');
var SearchActionCreators = require('../actions/SearchActionCreators');
var SearchResultsDropdown = require('./SearchResultsDropdown');
var SearchStore = require('../stores/SearchStore');
var TrackStore = require('../stores/TrackStore');
var _ = require('underscore');

// Don't fire off a query until you stop typing in the search box for this
// many milliseconds.
const SEARCH_DEBOUNCE_TIME = 200;

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

    state.dropdownHidden = false;
    return state;
  },

  componentDidMount: function() {
    SearchStore.addChangeListener(this.handleChange);
    this._searchTimeoutId = null;
  },

  componentWillUnmount: function() {
    SearchStore.removeChangeListener(this.handleChange);
    if (this._searchTimeoutId !== null) {
      clearTimeout(this._searchTimeoutId);
    }
  },

  handleBlur: function() {
    this.setState({dropdownHidden: true});
  },

  handlePossibleBlur: function(e) {
    // Filter blur events so that handleBlur is not called if some *part*
    // of the search box (either the input, or a link in the dropdown) still
    // has focus.
    //
    // For example:
    // 1. Type in the input.
    // 2. Autocomplete results show up.
    // 3. Click an autocomplete result.
    //
    // That's a blur event for the <input />, but the result link still has
    // focus, so that should *not* be a blur event for the <SearchBox />.
    //
    // setTimeout is because while this event handler is being called,
    // document.activeElement is momentarily equal to the body element
    // apparently.

    setTimeout(() => {
      if (!this.isMounted()) {
        return;
      }
      if (
        document.activeElement !== this.refs.input.getDOMNode() &&
        (
          !this.isDropdownPresent() ||
          !this.refs.dropdown.getDOMNode().contains(document.activeElement)
        )
      ) {
        this.handleBlur(e);
      }
    }, 0);
  },

  handleFocus: function() {
    this.setState({dropdownHidden: false});
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
    if (query === '') {
      // This doesn't result in an actual request, so hide the results
      // immediately.
      SearchActionCreators.changeQuery(query);
    } else {
      // Debounce to prevent sending too many requests while you're still
      // typing.
      if (this._searchTimeoutId !== null) {
        clearTimeout(this._searchTimeoutId);
      }
      this._searchTimeoutId = setTimeout(() => {
        SearchActionCreators.changeQuery(query);
      }, SEARCH_DEBOUNCE_TIME);
    }
  },

  isDropdownPresent: function() {
    var {dropdownHidden, transientQuery, results} = this.state;
    return (
      !dropdownHidden &&
      transientQuery !== '' &&
      results && results.items.length > 0
    );
  },

  render: function() {
    var {transientQuery, results} = this.state;

    // TODO: Also don't render dropdown if the hypothetical LayerStore(?) says
    // not to (in case user clicks elsewhere on the page and hides it).
    var shouldRenderDropdown = this.isDropdownPresent();

    // TODO: Maybe show in some way if the results are stale? Spinner?
    var maybeDropdown = shouldRenderDropdown ?
      <SearchResultsDropdown
        items={results.items}
        onBlur={this.handlePossibleBlur}
        ref="dropdown"
      /> :
      null;

    return (
      <span className="SearchBox">
        <input
          className="SearchBoxInput"
          onBlur={this.handlePossibleBlur}
          onChange={this.handleInput}
          onFocus={this.handleFocus}
          ref="input"
          value={transientQuery}
        />
        {maybeDropdown}
      </span>
    );
  }
});

module.exports = SearchBox;
