export type ServerSearchResult = [
  'track' | 'album',
  number
];

export type ServerTrack = {
  album_id: ?number,
  artist: string,
  id: number,
  title: string,
  track: ?number,
};

export type ServerAlbum = {
  artist: string,
  cat_number: ?string,
  cover_art: ?string,
  date: ?string,
  id: number,
  label: ?string,
  title: string,
  track_ids: Array<number>,
};
