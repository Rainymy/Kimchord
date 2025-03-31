"use strict";
const { handleVideo } = require('../../Components/handler/handleVideo.js');
const { createAudioPlayer } = require('@discordjs/voice');
const { PRESETS } = require('../../Components/permission/permissions.js');
const radioInfo = require('../../Components/handler/radioStations.js');
const { createEmptyReadableStream } = require('../../Components/handler/handleRequests.js');

const messageInfo = require('../../Components/message/messageInfo.js');
const { codeBlock } = require('../../Components/embed/markup.js');
const { formatToEmbed } = require('../../Components/embed/formatToEmbed.js');
const { measureText } = require('../../Components/util/util.js');

let radioStations;

function expandStringFromSide(str, amounts) {
  str = str.padStart(str.length + Math.ceil(amounts / 2), " ");
  str = str.padEnd(str.length + Math.ceil(amounts / 2), " ");

  return str;
}

async function radio(message, basicInfo, searchString, queue) {
  if (!radioStations?.isCached) {
    radioStations = await radioInfo.getAllRadioStations();
  }

  const voiceChannel = message.member.voice.channel;
  const lowerCaseSearch = searchString?.toLowerCase();

  if (lowerCaseSearch === "list") {
    const stationNames = Object.values(radioStations.shorts);

    const right = [];
    const left = [];
    let longestTextSize = 0;
    let longestText = "";

    for (let i = 0; i < stationNames.length; i++) {
      const name = radioStations.cache[stationNames[i]].name;
      const titleSize = measureText(name);

      if (longestTextSize < titleSize) {
        longestTextSize = titleSize;
        longestText = name;
      }

      i % 2 === 0 ? right.push(name) : left.push(name);
    }

    const placeholderTitle = "".padStart(longestText.length, " ");
    const textWidthLine = "".padStart(longestTextSize * 2 / measureText("-"), "-");
    const widthOfSpace = measureText(" ");
    const result = [];
    const expandRate = 1.1;
    let delta;

    for (let j = 0; j < right.length; j++) {
      if (!right[j]) { right[j] = placeholderTitle; }
      if (!left[j])  {  left[j] = placeholderTitle; }

      delta = (expandRate * longestTextSize) - measureText(right[j]);
      right[j] = expandStringFromSide(right[j], delta / widthOfSpace);

      delta = (expandRate * longestTextSize) - measureText(left[j]);
      left[j] = expandStringFromSide(left[j], delta / widthOfSpace);

      result.push(`${right[j]}  ${left[j]}`);
    }

    result.push(textWidthLine);
    result.unshift(textWidthLine);

    return message.channel.send(result.join("\n"));
  }

  const nameByShort = radioStations.shorts?.[lowerCaseSearch];
  const nameByLong = radioStations.cache?.[lowerCaseSearch]?.name?.toLowerCase();

  let stationName = nameByShort ? nameByShort: nameByLong;
  if (!stationName) {
    message.channel.send([
      "FM Radio station name not found.",
      'Defaulting to `Lugna Favoriter`',
      [
        `type ${basicInfo.prefix}`,
        `\`${(this.aliases.join && this.aliases.join("|"))?? this.aliases} list\``,
        " to se available stations"
      ].join("")
    ].join("\n"));
    stationName = "lugna favoriter";
  }

  const station = await radioStations.get(radioStations.cache[stationName].id);
  const fmLink = station.livestream[0].url;

  const video = {
    id: null,
    title: `${stationName}: ${station.currentsong.song.title}`,
    url: fmLink,
    duration: parseInt(station.currentsong.run_length),
    thumbnail: radioStations.thumbnail(station.currentsong.song.cover_art),
    type: "radio",
    getStream: async () => {
      const response = await radioStations.stream(fmLink);

      if (response.error) {
        message.channel.send(codeBlock(response.comment, "js"));

        return createEmptyReadableStream();
      }

      return response;
    },
    fmStationID: radioStations.cache[stationName].id,
    updateInfo: radioStations.update
  }

  const args = {
    video: video,
    voiceChannel: voiceChannel,
    audioPlayer: createAudioPlayer({ behaviors: { noSubscriber: "pause"} }),
    queue: queue,
    guild: {
      channel: message.channel,
      author: message.author
    }
  }

  console.log("User listening to radio");
  const [ addedSong, songQueue ] = handleVideo(args);

  if (addedSong) {
    addedSong.description = messageInfo.songAddedToQueue;
    let [container, embed] = formatToEmbed(addedSong, false, songQueue);

    return message.channel.send(container);
  }

  return;
}

module.exports = {
  name: "Play FM Radio",
  permissions: [
    PRESETS.PERMISSIONS.TEXT,
    PRESETS.PERMISSIONS.MUSIC,
    PRESETS.PERMISSIONS.CONNECT_REQUIRED,
    PRESETS.PERMISSIONS.ROLE_REQUIRED
  ],
  aliases: [ "radio", "fm" ],
  main: radio
}
