"use strict";
const { formatToEmbed } = require('../embed/formatToEmbed.js');
const messageInfos = require('../message/messageInfo.js');

const music_status = {
  paused: "⏸ Paused the music for you! ⏸",
  resumed: "▶️ Resumed the music for you! ▶️",
  play: "🎶 Now Playing 🎶",
  default: "🌊 Current music 🌊"
}

const audioError = {
  connection: messageInfos.errorStreamDetail("Lost connection to server"),
  notPlayable: messageInfos.errorStreamDetail("Unplayable media"),
  unknown: messageInfos.errorStreamDetail("error from player")
}

function addEventListener(serverQueue, queue, musicPlayer) {
  const sendEmbedStatus = (state="default") => {
    const songQueues = serverQueue.songs;
    const [ container, embed ] = formatToEmbed(songQueues[0], false, songQueues);

    if (!embed) { return serverQueue.textChannel.send("No embed"); }
    embed.description = music_status[state] ?? "";

    serverQueue.textChannel.send(container)
      .catch(e => { console.log("At EventListener", e); });

    return;
  }

  // Events: idle, autopaused, buffering, paused, playing, error
  serverQueue.audioPlayer.on("idle", async () => {
    serverQueue.songs.shift();
    const guild_id = serverQueue.textChannel.guild.id;

    const currentSong = await musicPlayer(guild_id, serverQueue.songs[0], queue);
    if (!currentSong) {
      serverQueue.textChannel.send([
        "No songs in the queue",
        "Initiating [ Bean Chillin' ] Mode 🍦🥶"
      ].join("\n"));

      serverQueue.timeout.id = setTimeout(() => {
        const inactiveDuration = serverQueue.timeout.duration / 60 / 1000;
        serverQueue.textChannel.send(
          `Bean frozen to death 💀 (survived for ${inactiveDuration} minutes)`
        ).catch(e => { console.log(e); });

        if (serverQueue.connection._state.status !== "destroyed") {
          serverQueue.connection.destroy();
        }

        queue.delete(guild_id);
      }, serverQueue.timeout.duration);
    }
  });

  serverQueue.audioPlayer.on("paused", () => {
    return sendEmbedStatus("paused");
  });

  serverQueue.audioPlayer.on("playing", (previous) => {
    if (previous.status === "autopaused") { return; }
    const status = previous.status === "paused" ? "resumed" : "play";

    sendEmbedStatus(status);

    if (status === "play" && serverQueue.songs[0].isLive) {
      serverQueue.textChannel.send(
        "Live stream is in experimental mode!, *May not work properly*"
      );
    }
  });

  serverQueue.audioPlayer.on('error', (error) => {
    sendEmbedStatus();

    if (error.name === "RequestError") {
      return serverQueue.textChannel.send(audioError.connection);
    }

    if (!serverQueue.audioPlayer.checkPlayable()) {
      serverQueue.songs?.[0]?.requestDelete();
      serverQueue.textChannel.send(audioError.notPlayable);
      return;
    }

    console.log("From audioPlayer: ", error);
    serverQueue.textChannel.send(audioError.unknown);

    return;
  });
}

module.exports = { addEventListener }
