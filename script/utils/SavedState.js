"use strict";
// @flow

import PlaylistActionCreators from '../actions/PlaylistActionCreators';

export type SavedPlaylistItem = {
  id: string,
  checksum: number,  // adler32.str(artist + title)
};

export function update(
  items: Array<SavedPlaylistItem>,
  index: number,
  paused: boolean,
  trackTime: number
) {
  localStorage.setItem(
    'potsfyi-playlist',
    JSON.stringify({
      items,
      index,
      paused,
      trackTime,
    })
  );
}

export function clear() {
  localStorage.removeItem('potsfyi-playlist');
}

export function read() {
  const savedJson = localStorage.getItem('potsfyi-playlist');
  if (!savedJson) {
    return;
  }

  let savedData;
  try {
    savedData = JSON.parse(savedJson);
  } catch(e) {
    console.error('invalid saved playlist info');
    return;
  }

  if (
    Array.isArray(savedData.items)
    && savedData.items.every(item => (
      typeof item.id === 'string'
      && typeof item.checksum === 'number'
    ))
    && typeof savedData.index === 'number'
    && typeof savedData.paused === 'boolean'
    && typeof savedData.trackTime === 'number'
  ) {
    PlaylistActionCreators.loadWithPlaylistData(
      savedData.items,
      savedData.index,
      savedData.paused,
      savedData.trackTime
    );
  } else {
    console.error('bad saved playlist data', savedData);
  }
}
