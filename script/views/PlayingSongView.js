/** @jsx React.DOM */
"use strict";

var $ = require('../lib/jquery.shim'),
    _ = require('underscore'),
    Backbone = require('backbone'),
    React = require('react'),
    util = require('../util'),
    DEFAULT_BG = '/static/img/pattern.png';

// XXX: This really shouldn't be the body's background, but the background
// of a React component, set in that component's render method.
function setBG(file) {
    file = file || DEFAULT_BG;
    $('body').css('background-image', 'url(' + file + ')');
}

var PlayingSongView = React.createBackboneClass({
    render: function() {
        var songId = this.getModel().get('id');

        // Force the old track to stop downloading, if applicable.
        //
        // XXX: This really belongs in componentWillReceiveProps, but since
        // we're using a Backbone model as our only prop, the props don't
        // actually change. In that sense, React-Backbone is kind of a hack.
        if (this.isMounted())
            $('audio', this.getDOMNode()).trigger('pause').attr('src', '');

        if (songId === -1) { // No song playing.
            // Setting the background here looks redundant, but isn't -
            // componentDidUpdate isn't called on the first render.
            setBG();
            return <div id="player" />;
        }

        var wantedFormats = util.supportedFormats();
        var filename = '/song/' + songId + '/' + wantedFormats;
        var isPlaying = true; // FIXME: not reactive, copied from Backbone view

        return (
            <div id="player">
                {filename ?
                    <audio src={filename}>
                        {'Your browser does not support HTML5 audio!'}
                    </audio>
                    : ''}
                <div id="control-buttons">
                    <button id="btn-play-pause" type="button"
                            onClick={this.playPauseHandler}>
                        {isPlaying ? "Pause" : "Play"}
                    </button>
                    <button id="btn-prev" type="button"
                        onClick={this.props.prevSongHandler}>
                        {'Previous Track'}</button>
                    <button id="btn-next" type="button"
                        onClick={this.props.nextSongHandler}>
                        {'Next Track'}</button>
                </div>
            </div>
        );
    },

    componentDidUpdate: function(prevProps, prevState) {
        // FIXME: this should check if the new song = the old song, and should
        // play or pause appropriately - clicking play or pause button should
        // trigger an update here. Not reactive - copied from BB view.

        var rootNode = this.getDOMNode();
        var audioSel = $('audio', rootNode);
        audioSel.trigger('play');

        // Set up handler to move to next song when song finished.
        audioSel.off('ended');
        audioSel.on('ended', this.props.nextSongHandler);

        // update the cover art
        var bg = DEFAULT_BG;
        if (this.getModel().has('album')) {
            var album = this.getModel().get('album');
            if (typeof album === 'object' && album.has_cover_art)
                bg = '/albumart/' + album.id;
        }
        setBG(bg);
    },

    playPauseHandler: function() {
        var audioEl = $('audio', this.getDOMNode()).get(0);
        var playPauseBtnSel = $('#btn-play-pause', this.getDOMNode());
        if (audioEl && !audioEl.paused) {
            audioEl.pause();
            playPauseBtnSel.text('Play');
        } else if (audioEl) {
            audioEl.play();
            playPauseBtnSel.text('Pause');
        }
    }
});

module.exports = PlayingSongView;
