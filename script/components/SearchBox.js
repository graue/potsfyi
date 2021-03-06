"use strict";

import {
  addToPlaylist,
  searchAsync,
} from '../actions/ActionCreators';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import SearchResultsDropdown from './SearchResultsDropdown';

import './SearchBox.css';

// Don't fire off a query until you stop typing in the search box for this
// many milliseconds.
const SEARCH_DEBOUNCE_TIME = 200;

// Fetch metadata for a search result (album or track).
// Example:
// Input: {id: 32, isAlbum: false}
// Output: {id: 32, isAlbum: false, title: 'Get Lucky', artist: 'Daft Punk'}
function hydrate(state, item) {
  if (item.isAlbum) {
    return {
      isAlbum: true,
      id: item.id,
      ...state.albumCache.cache[item.id],
    };
  } else {
    return {
      isAlbum: false,
      id: item.id,
      ...state.trackCache.cache[item.id],
    };
  }
}

function mapStateToProps(state) {
  return {
    isLoading: state.search.isLoading,
    query: state.search.query,
    resultItems: state.search.results.items.map(
      item => hydrate(state, item)
    ),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onDebouncedQueryChange(query) {
      // $FlowFixMe: need better dispatch type
      dispatch(searchAsync(query));
    },
    onTrackAdd(tracksToAdd) {
      dispatch(addToPlaylist(tracksToAdd));
    },
  };
}

class SearchBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // Transient query: whatever's actually in the textbox right now. The
      // 'query' value we put in an action and pull from the store is a
      // debounced version of this, so that as you're typing, you see the effect
      // of each keystroke immediately, but we limit actual AJAX requests.
      transientQuery: props.query || '',
      // Was the dropdown explicitly hidden? (It will also be hidden if there's
      // an empty search string and no results.)
      dropdownHidden: false,
    };
  }

  componentDidMount() {
    this._blurTimeoutId = null;
    this._searchTimeoutId = null;
  }

  componentWillUnmount() {
    clearTimeout(this._searchTimeoutId);
    clearTimeout(this._blurTimeoutId);
  }

  _handleBlur = (e) => {
    this.setState({dropdownHidden: true});
  }

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
      const dropdownNode = ReactDOM.findDOMNode(this.refs.dropdown);
      if (
        document.activeElement !== this._inputNode &&
        (
          !this._isDropdownPresent() ||
          !dropdownNode ||
          !dropdownNode.contains(document.activeElement)
        )
      ) {
        this._handleBlur(e);
      }
    }, 0);
  }

  _handleResultClick = (index, e) => {
    const item = this.props.resultItems[index];
    const tracksToAdd = item.isAlbum ? item.tracks : [item.id];
    this.props.onTrackAdd(tracksToAdd);
  }

  _handleFocus = (e) => {
    this.setState({dropdownHidden: false});
  }

  focus() {
    const node = this._inputNode;
    if (node) {
      node.focus();
      node.select();
    }
  }

  _handleInput = (event) => {
    const query = event.target.value;
    this.setState({transientQuery: query});

    if (query === '') {
      // This doesn't result in an actual request, so hide the results
      // immediately.
      this.props.onDebouncedQueryChange(query);
    } else {
      // Debounce to prevent sending too many requests while you're still
      // typing.
      if (this._searchTimeoutId !== null) {
        clearTimeout(this._searchTimeoutId);
      }
      this._searchTimeoutId = setTimeout(() => {
        this.props.onDebouncedQueryChange(query);
      }, SEARCH_DEBOUNCE_TIME);
    }
  }

  _isDropdownPresent() {
    const {dropdownHidden, transientQuery} = this.state;
    const {query} = this.props;
    return (
      !dropdownHidden
      && transientQuery !== ''
      && query !== ''
    );
  }

  render() {
    const {resultItems, isLoading} = this.props;
    const {transientQuery} = this.state;
    const shouldRenderDropdown = this._isDropdownPresent();

    // TODO: Maybe show in some way if the results are stale? Spinner?
    const maybeDropdown = shouldRenderDropdown ?
      <SearchResultsDropdown
        isLoading={isLoading}
        items={resultItems}
        onBlur={this._handlePossibleBlur}
        onItemClick={this._handleResultClick}
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
          ref={c => this._inputNode = c}
          value={transientQuery}
        />
        {maybeDropdown}
      </span>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  (stateProps, dispatchProps, ownProps) => ({
    ...ownProps,
    ...dispatchProps,
    ...stateProps,
  }),
  {forwardRef: true}
)(SearchBox);
