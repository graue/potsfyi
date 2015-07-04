"use strict";

import AlbumStore from '../stores/AlbumStore';
import React from 'react';
import SearchActionCreators from '../actions/SearchActionCreators';
import SearchResultsDropdown from './SearchResultsDropdown';
import SearchStore from '../stores/SearchStore';
import TrackStore from '../stores/TrackStore';

// Don't fire off a query until you stop typing in the search box for this
// many milliseconds.
const SEARCH_DEBOUNCE_TIME = 200;

// Fetch metadata for a search result (album or track).
// Example:
// Input: {id: 32, isAlbum: false}
// Output: {id: 32, isAlbum: false, title: 'Get Lucky', artist: 'Daft Punk'}
function hydrate(item) {
  const fetcher = item.isAlbum ? AlbumStore.getAlbum : TrackStore.getTrack;
  return {...item, ...fetcher(item.id)};
}

function getStateFromStores() {
  let state = {
    isLoading: SearchStore.isLoading(),
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
  getInitialState() {
    let state = getStateFromStores();

    // Transient query: whatever's actually in the textbox right now. The
    // 'query' value we put in an action and pull from the store is a
    // debounced version of this, so that as you're typing, you see the effect
    // of each keystroke immediately, but we limit actual AJAX requests.
    state.transientQuery = state.query || '';

    state.dropdownHidden = false;
    return state;
  },

  componentDidMount() {
    SearchStore.addChangeListener(this.handleChange);
    this._searchTimeoutId = null;
  },

  componentWillUnmount() {
    SearchStore.removeChangeListener(this.handleChange);
    if (this._searchTimeoutId !== null) {
      clearTimeout(this._searchTimeoutId);
    }
  },

  handleBlur() {
    this.setState({dropdownHidden: true});
  },

  handlePossibleBlur(e) {
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
        document.activeElement !== React.findDOMNode(this.refs.input) &&
        (
          !this.isDropdownPresent() ||
          !React.findDOMNode(this.refs.dropdown).contains(document.activeElement)
        )
      ) {
        this.handleBlur(e);
      }
    }, 0);
  },

  handleFocus() {
    this.setState({dropdownHidden: false});
  },

  handleChange() {
    this.setState(getStateFromStores());
  },

  focus() {
    let node = React.findDOMNode(this.refs.input);
    node.focus();
    node.select();
  },

  handleInput(event) {
    const query = event.target.value;
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

  isDropdownPresent() {
    const {dropdownHidden, query, transientQuery} = this.state;
    return (
      !dropdownHidden
      && transientQuery !== ''
      && query !== ''
    );
  },

  render() {
    const {transientQuery, results, isLoading} = this.state;
    const shouldRenderDropdown = this.isDropdownPresent();

    // TODO: Maybe show in some way if the results are stale? Spinner?
    const maybeDropdown = shouldRenderDropdown ?
      <SearchResultsDropdown
        isLoading={isLoading}
        items={results ? results.items : []}
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
  },
});

export default SearchBox;
