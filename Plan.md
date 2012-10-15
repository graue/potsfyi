# Pots, fyi: a music streaming client and server.



## Goals

 1. Make a large personal music collection (2,100+ albums; 20,000+ songs) available for listening anywhere, instantly, including on devices with limited storage such as an SSD-based notebook or a smartphone.
 2. Provide as quick and responsive a listening experience as if all tracks were stored locally.
 3. Be robust to slow networks with high packet loss. Tolerate complete loss of signal for 30sec - 2min, with no impact on what’s playing.
 4. When network speeds allow, compress the audio in a completely transparent manner or not at all.
 5. Allow recently played tracks to be replayed even while offline. The same song should never be downloaded to the same device twice in a day (unless to improve the quality because the first download was sent at a lower bitrate).
 6. Provide both a CLI and a web or native interface, which allow searching and queueing songs as well as viewing metadata. Where available, show high-quality cover art in the web/native interface.
 7. Log plays so that external apps can provide listening analysis and statistics.

### Non-goals

 1. Edit tags or import new music within the provided interface.
 2. Accommodate multiple users.
 3. Include any peer-to-peer technology.
 4. Play music locally, e.g. through a headphone jack on the “server”.
 5. Support non-music media types such as video or photos.

These features lie outside the initial scope of the project. While some might be useful, they should not receive effort or consideration until the above goals are fully met.



## Alternatives and prior art

### Spotify

Ad-supported or paid service. Streams in 96, 160 or 320kbps Vorbis. May have solved some of the same technical problems I aim to: boasts being “buffer-free” (possibly due to pre-fetching), and recommends a 1 GB or larger cache, from which recently streamed songs can likely be replayed. Reportedly has a huge music library including many obscure artists.

For my use, however, there are definitely going to be gaps in their library, including self-published music like [Raised by Wolves](http://raisedbywolvesmusic.dreamhosters.com). In these cases, Spotify can play back local files but does not allow uploading those files to Spotify for streaming back to other devices. So it fails to satisfy goal #1.

A command-line interface could be created on top of the open-source [Despotify](http://despotify.se/) library, but this is blocked unless you subscribe to Spotify's premium service for $10 a month. So goal #6 requires payment, as well as continual cooperation on Spotify's part with open-source developers, which is not guaranteed.

Spotify's mobile version only streams in 96kbps, regardless of connection speed, so goal #4 is not satisfied.

Even if Spotify satisfied all seven goals, the service’s financial sustainability is unclear. They pay so much to record labels that despite massive gross returns, they are still losing money. Spotify’s continued existence in its present form is far from certain, and giving up one’s own music library to rely on it is a risky proposition.

### Google Play Music

Google’s music streaming service apparently allows [uploading up to 20,000 songs for free](http://play.google.com/about/music/unlock/), which are then “instantly available on the web and your Android phone”. This comes very close to meeting goal #1. Details of the service, such as bitrate and whether it allows exporting listen logs, are not clear.

An [open-source desktop client for Windows](https://gmusic.codeplex.com/) exists and is apparently tolerated by Google. If it is indeed fully open source, other interfaces could be created to satisfy goal #6.

The service is only offered in the U.S., so depending on how that is implemented, the “anywhere” part of goal #1 may not be satisfied — streaming might not work when abroad. Also, as with Spotify, a change or discontinuation of the service is possible at any time.

### Music Player Daemon (MPD)

For local playback, MPD is very capable. Its HTTP streaming, however, is designed in such a way that it is fundamentally unsuitable except in very low latency environments, or for use with predefined playlists.

MPD works like an internet radio station and sends only a single, continuous stream of audio data to the client. As a result, if the buffer length is 5 seconds and the listener clicks “Pause”, music continues to play for 5 seconds before pausing. If the user skips to a new track, the current track continues to play for 5 seconds first. And so on.

This control lag results in a substantially degraded listening experience compared to storing music locally. Furthermore, while lag can be reduced by shortening the buffer length, doing so makes MPD completely intolerant of network hiccups. There is no way to eliminate both control lag and buffering delays because the MPD streaming client cannot prefetch song data intelligently, then disregard it if the user pauses, seeks or skips the track.

Because of this architecture, and because MPD does not implement adaptive bitrate use based on network capacity, it cannot satisfy goals #2, #3, #4, and #5. It does satisfy #1, #6, #7 and implements several elements of the proposed Pots, fyi server — decoding audio, reading tags, and storing tag information in a searchable database.



## Overview of Pots, fyi

Will be written in a high-level language (likely Python) for productivity and maintainability. Aspects likely to be memory- or CPU-intensive — audio decoding, encoding, and storing track information in a database — will be delegated to already-existing libraries written in C or C++.