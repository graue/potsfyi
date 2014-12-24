/** @jsx React.DOM */
"use strict";

var React = require('react');

var SearchResultView = React.createBackboneClass({
    render: function() {
        var m = this.getModel();
        var hasCoverArt = m.get('has_cover_art');
        var title = m.get('title');
        var artist = m.get('artist');
        var id = m.get('id');

        // XXX Pretty hacky... we test whether the response has a
        // has_cover_art attribute. If it does (even if the attribute
        // is false!), it's an album, otherwise it's a song result.
        var isAlbum = (hasCoverArt !== undefined);

        var clickHandler = (function(event) {
            event.preventDefault();
            if (isAlbum)
                this.props.albumClickHandler(id);
            else
                this.props.songClickHandler(this.getModel().attributes);
        }).bind(this);

        return (
            <li className={isAlbum ? 'result-album' : 'result-song'}>
                <a href="#" onClick={clickHandler}>
                    {hasCoverArt
                        ? <img alt="" src={'/albumart/' + id} />
                        : ''}
                    <span className="artist-name">{artist}</span>
                    {isAlbum ? <br /> : ' — '}
                    <span className={isAlbum ? 'album-name' : 'song-name'}>
                    {title}
                    </span>
                </a>
            </li>
        );
    }
});

module.exports = SearchResultView;
