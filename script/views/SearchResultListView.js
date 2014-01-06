/** @jsx React.DOM */
"use strict";

var React = require('react'),
    SearchResultView = require('./SearchResultView');

var SearchResultListView = React.createBackboneClass({
    render: function() {
        var that = this;
        var resultNodes = this.getModel().models.map(function(result) {
            return <SearchResultView model={result}
                        songClickHandler={that.props.songClickHandler}
                        albumClickHandler={that.props.albumClickHandler} />;
        });
        return (
            <ul id="search-results">
              {resultNodes}
            </ul>
        );
    }
});

module.exports = SearchResultListView;
