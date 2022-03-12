const messageInfos = {
  notInVoiceChannel: "I'm sorry but you need to be in a voice channel to play music!",
  permissionNeeded: (permission) => { return `I cannot *${permission}*, make sure I have the proper permissions!`; },
  videoNotFoundOrAvailable: "🆘 Video unavailable OR I could not obtain any search results. 🆘",
  videoDownloading: "Downloading.... [0s -> 5s]",
  skippingDownload: (title, comment) => { return `Skipping Download: [${title}] : ${comment}`; },
  downloadFailed: (title, comment) => { return `Download Failed: [${title}] : ${comment}` },
  songLoading: "Song Loading... Wait a moment",
  songAddedToQueue: "✅ has been added to the queue! ✅",
  playlistAddedToQueue: "🔀 has been added to the queue 🔀",
  songPaused: 'Music is Paused!',
  nothingPlaying: 'There is nothing playing 😂',
  queueIsEmpty: "Queue is Empty",
}

module.exports = messageInfos;