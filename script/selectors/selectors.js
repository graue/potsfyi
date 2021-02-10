"use strict";

export function getPlayingTrack(state) {
  const {playlist, playingIndex} = state.playStatus;
  if (playingIndex == null) {
    return null;
  }
  return playlist[playingIndex][0];
}

export function isPlaylistEmpty(state) {
  return state.playStatus.playlist.length === 0;
}

export function isAnythingPlaying(state) {
  return state.playStatus.playingIndex != null;
}

export function canPrev(state) {
  return isAnythingPlaying(state) && (state.playStatus.playingIndex || 0) > 0;
}

export function canNext(state) {
  const {playingIndex, playlist} = state.playStatus;
  return (
    isAnythingPlaying(state)
    && (playingIndex || 0) < playlist.length - 1
  );
}

export function canPlay(state) {
  return (
    !isPlaylistEmpty(state) && (
      !isAnythingPlaying(state) || state.playStatus.paused
    )
  );
}

export function canPause(state) {
  return isAnythingPlaying(state) && !state.playStatus.paused;
}

