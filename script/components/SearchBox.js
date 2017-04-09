"use strict";

import AlbumStore from '../stores/AlbumStore';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import SearchActionCreators from '../actions/SearchActionCreators';
import SearchResultsDropdown from './SearchResultsDropdown';
import SearchStore from '../stores/SearchStore';
import TrackStore from '../stores/TrackStore';

import './SearchBox.css';

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

class SearchBox extends React.Component {
  constructor(props) {
    super(props);
    const initialState = getStateFromStores();

    // Transient query: whatever's actually in the textbox right now. The
    // 'query' value we put in an action and pull from the store is a
    // debounced version of this, so that as you're typing, you see the effect
    // of each keystroke immediately, but we limit actual AJAX requests.
    initialState.transientQuery = initialState.query || '';

    initialState.dropdownHidden = false;
    this.state = initialState;
  }

  componentDidMount() {
    SearchStore.addChangeListener(this._handleChange);
    this._blurTimeoutId = null;
    this._searchTimeoutId = null;
  }

  componentWillUnmount() {
    SearchStore.removeChangeListener(this._handleChange);
    clearTimeout(this._searchTimeoutId);
    clearTimeout(this._blurTimeoutId);
  }

  _handleBlur = () => {
    this.setState({dropdownHidden: true});
  };

  _handlePossibleBlur = (e) => {
    // Filter blur events so that _handleBlur is not called if some *part*
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

    clearTimeout(this._blurTimeoutId);
    this._blurTimeoutId = setTimeout(() => {
      if (
        document.activeElement !== ReactDOM.findDOMNode(this.refs.input) &&
        (
          !this._isDropdownPresent() ||
          !ReactDOM.findDOMNode(this.refs.dropdown)
            .contains(document.activeElement)
        )
      ) {
        this._handleBlur(e);
      }
    }, 0);
  };

  _handleFocus = () => {
    this.setState({dropdownHidden: false});
  };

  _handleChange = () => {
    this.setState(getStateFromStores());
  };

  focus() {
    let node = ReactDOM.findDOMNode(this.refs.input);
    node.focus();
    node.select();
  }

  _handleInput = (event) => {
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
  };

  _isDropdownPresent() {
    const {dropdownHidden, query, transientQuery} = this.state;
    return (
      !dropdownHidden
      && transientQuery !== ''
      && query !== ''
    );
  }

  render() {
    const {transientQuery, results, isLoading} = this.state;
    const shouldRenderDropdown = this._isDropdownPresent();

    // TODO: Maybe show in some way if the results are stale? Spinner?
    const maybeDropdown = shouldRenderDropdown ?
      <SearchResultsDropdown
        isLoading={isLoading}
        items={results ? results.items : []}
        onBlur={this._handlePossibleBlur}
        ref="dropdown"
      /> :
      null;

    return (
      <span className="SearchBox">
        <input
          className="SearchBox_Input"
          onBlur={this._handlePossibleBlur}
          onChange={this._handleInput}
          onFocus={this._handleFocus}
          ref="input"
          value={transientQuery}
        />
        {maybeDropdown}
      </span>
    );
  }
}

export default SearchBox;
