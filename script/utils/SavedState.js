"use strict";

export function update(stateToSave) {
  localStorage.setItem(
    'potsfyi-playlist',
    JSON.stringify(stateToSave)
  );
}

export function read() {
  const savedJson = localStorage.getItem('potsfyi-playlist');
  if (!savedJson) {
    return null;
  }

  let savedData;
  try {
    savedData = JSON.parse(savedJson);
  } catch(e) {
    console.error('invalid saved playlist info');
    return null;
  }

  if (
    Array.isArray(savedData.items)
    && savedData.items.every(item => (
      typeof item.id === 'string'
      && typeof item.checksum === 'number'
    ))
    && (savedData.index == null || typeof savedData.index === 'number')
    && typeof savedData.paused === 'boolean'
    && typeof savedData.trackTime === 'number'
  ) {
    return savedData;
  } else {
    console.error('bad saved playlist data', savedData);
    return null;
  }
}
