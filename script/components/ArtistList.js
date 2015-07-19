"use strict";

import AlbumStore from '../stores/AlbumStore';
import ArtistStore from '../stores/ArtistStore';
import PlaylistActionCreators from '../actions/PlaylistActionCreators';
import React from 'react';

function getStateFromStores() {
  const artistNames = ArtistStore.getAll();
  const artistsWithDetails = artistNames.map(
    (name) => ({
      name,
      albums: ArtistStore.getAlbumsBy(name).map(
        (albumId) => ({
          id: albumId,
          ...AlbumStore.getAlbum(albumId),
        })
      ),
    })
  );

  return {artists: artistsWithDetails};
}

class ArtistList extends React.Component {
  constructor() {
    super();
    this.state = getStateFromStores();
    this.handleChange = this.handleChange.bind(this);
    this.renderAlbum = this.renderAlbum.bind(this);
    this.renderArtist = this.renderArtist.bind(this);
  }

  componentDidMount() {
    AlbumStore.addChangeListener(this.handleChange);
    ArtistStore.addChangeListener(this.handleChange);
  }

  componentWillUnmount() {
    AlbumStore.removeChangeListener(this.handleChange);
    ArtistStore.removeChangeListener(this.handleChange);
  }

  handleChange() {
    this.setState(getStateFromStores());
  }

  handleAlbumClick(album) {
    PlaylistActionCreators.addToPlaylist(album.tracks);
  }

  renderAlbum(album) {
    return (
      <li className="ArtistList_albumListItem" key={album.id}>
        <img
          className="ArtistList_albumListItemImage"
          title={album.name}
          src={album.coverArt || null}
          onClick={this.handleAlbumClick.bind(this, album)}
        />
      </li>
    );
  }

  renderArtist(artist) {
    return (
      <li key={artist.name}>
        <h3>{artist.name}</h3>
        <ul className="ArtistList_albumList">
          {artist.albums.map(this.renderAlbum)}
        </ul>
      </li>
    );
  }

  render() {
    return (
      <ul className="ArtistList">
        {this.state.artists.map(this.renderArtist)}
      </ul>
    );
  }
}

export default ArtistList;
