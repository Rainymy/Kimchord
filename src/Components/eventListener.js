const { formatToEmbed } = require('./formatToEmbed.js');

const music_status = {
  paused: "⏸ Paused the music for you! ⏸",
  resumed: "▶️ Resumed the music for you! ▶️",
  play: "🎶 Now Playing 🎶"
}

function formatEmbed(songQueue, status) {
  const currentSong = songQueue[0];
  const [ container, embed ] = formatToEmbed(currentSong, false, songQueue);
  if (!embed) { return; }
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
      serverQueue.textChannel.send("No songs in the queue");
      serverQueue.textChannel.send("Initiating [ Bean Chillin' ] Mode 🍦🥶");
      
      serverQueue.timeout.id = setTimeout(() => {
        const inactiveDuration = serverQueue.timeout.duration / 60 / 1000;
        serverQueue.textChannel.send(
          `Bean frozen to death 💀 (survived for ${inactiveDuration} minutes)`
        );
        
        if (serverQueue.connection._state.status !== "destroyed") {
          serverQueue.connection.destroy();
        }
        
        queue.delete(guild_id);
      }, serverQueue.timeout.duration);
    }
  });
  
  serverQueue.audioPlayer.on("paused", () => {
    const embed = formatEmbed(serverQueue.songs, "paused");
    if (!embed) { return serverQueue.textChannel.send("No embed"); }
    
    serverQueue.textChannel.send(embed);
  });
  
  serverQueue.audioPlayer.on("playing", (previous) => {
    if (previous.status === "autopaused") { return; }
    const status = previous.status === "paused" ? "resumed" : "play";
    
    const embed = formatEmbed(serverQueue.songs, status);
    if (!embed) { return serverQueue.textChannel.send("No embed"); }
    
    serverQueue.textChannel.send(embed);
    
    if (status === "play" && serverQueue.songs[0].isLive) {
      serverQueue.textChannel.send(
        "Live stream is in experimental mode!, *May not work properly*"
      );
    }
    
  });
  
  serverQueue.audioPlayer.on('error', (error) => {
    serverQueue.textChannel.send(`Error from player: ${error.message}`);
  });
}

module.exports = { addEventListener }