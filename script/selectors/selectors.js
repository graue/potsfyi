"use strict";
// @flow

import type {ReduxState as State} from '../stores/store';

export function getPlayingTrack(state: State): ?string {
  const {playlist, playingIndex} = state.playStatus;
  if (playingIndex == null) {
    return null;
  }
  return playlist[playingIndex][0];
}

export function isPlaylistEmpty(state: State): boolean {
  return state.playStatus.playlist.length === 0;
}

export function isAnythingPlaying(state: State): boolean {
  return state.playStatus.playingIndex != null;
}

export function canPrev(state: State): boolean {
  return isAnythingPlaying(state) && (state.playStatus.playingIndex || 0) > 0;
}

export function canNext(state: State): boolean {
  const {playingIndex, playlist} = state.playStatus;
  return (
    isAnythingPlaying(state)
    && (playingIndex || 0) < playlist.length - 1
  );
}

export function canPlay(state: State): boolean {
  return (
    !isPlaylistEmpty(state) && (
      !isAnythingPlaying(state) || state.playStatus.paused
    )
  );
}

export function canPause(state: State): boolean {
  return isAnythingPlaying(state) && !state.playStatus.paused;
}

