const messageInfos = {
  notInVoiceChannel: "I'm sorry but you need to be in a voice channel to play music!",
  permissionNeeded: (permission) => { return `I cannot *${permission}*, make sure I have the proper permissions!`; },
  requiresRoleName: (requiredRole) => { return `Requires "${requiredRole}" role.` },
  videoNotFoundOrAvailable: "🆘 Video unavailable OR I could not obtain any search results. 🆘",
  videoDownloading: "Downloading.... [0s -> 5s]",
  skippingDownload: (title, comment) => { return `Skipping Download: [${title}] : ${comment}`; },
  downloadFailed: (title, comment) => { return `Download Failed: [${title}] : ${comment}` },
  songLoading: "Song Loading... Wait a moment",
  songAddedToQueue: "✅ has been added to the queue! ✅",
  playlistAddedToQueue: "🔀 has been added to the queue 🔀",
  songPaused: "Music is Paused!",
  songAlreadyPaused: "Music already paused!",
  songPlaying: 'Music is playing!',
  nothingPlaying: 'There is nothing playing 😂',
  skippingSong: "Skipping current song.",
  queueIsEmpty: "Queue is Empty",
  foundNoSearchResults: "🆘 I could not obtain any search results. 🆘",
  foundSearchResult: "🔎 Found video 🔍",
  doesNotExist: "Doesn't exist",
  ERROR_CODE: (code) => { return `ERROR CODE: ${code}` },
  UNEXPECTED_ERROR: "Something went Wrong",
  commandDisabled: "Sorry this command is not working correctly. (disabled)",
  pingAwait: 'Ping is being appreciated... :bar_chart:',
  songQueueCollectorEnd: "Song queue timer run out"
}

module.exports = messageInfos;