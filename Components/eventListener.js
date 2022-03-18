const { formatToEmbed } = require('./formatToEmbed.js');

const music_status = {
  paused: "⏸ Paused the music for you! ⏸",
  resumed: "▶️ Resumed the music for you! ▶️",
  play: "🎶 Now Playing 🎶"
}

function formatEmbed(songQueue, status, author) {
  const currentSong = songQueue[0];
  const [ container, embed ] = formatToEmbed(currentSong, false, songQueue);
  embed.description = music_status[status];
  
  return container;
}

function addEventListener(serverQueue, queue, musicPlayer) {
  // Events: idle, autopaused, buffering, paused, playing, error
  serverQueue.audioPlayer.on("idle", async () => {
    serverQueue.songs.shift();
    const guild_id = serverQueue.textChannel.guild.id;
    
    const currentSong = await musicPlayer(guild_id, serverQueue.songs[0], queue);
    if (!currentSong) {
      serverQueue.connection.destroy();
      queue.delete(guild_id);
      console.log("No songs in the queue");
      serverQueue.textChannel.send("No songs in the queue");
    }
  });
  
  serverQueue.audioPlayer.on("paused", () => {
    const author = serverQueue.songs[0].requestedBy;
    
    const embed = formatEmbed(serverQueue.songs, "paused", author);
    serverQueue.textChannel.send(embed);
  });
  
  serverQueue.audioPlayer.on("playing", (previous) => {
    const status = previous.status === "paused" ? "resumed" : "play";
    const author = serverQueue.songs[0].requestedBy;
    
    const embed = formatEmbed(serverQueue.songs, status , author);
    serverQueue.textChannel.send(embed);
  });
  
  serverQueue.audioPlayer.on('error', (error) => {
    serverQueue.textChannel.send(`Error from player: ${error.message}`);
  });
}

module.exports = { addEventListener }