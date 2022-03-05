const { formatToEmbed } = require('../Components/formatToEmbed.js');
const { handleVideo } = require('../Components/handleVideo.js');
const { createAudioPlayer } = require('@discordjs/voice');
const request = require('../Components/request.js');
const radioInfo = require('../Components/radioStations.js');
const measureText = require('../Components/measureText.js');

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
  if (!voiceChannel) {
    return message.channel.send(
      "I'm sorry but you need to be in a voice channel to play music!"
    );
  }
  
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
  
  let nameByShort = radioStations.shorts?.[lowerCaseSearch];
  let nameByLong = radioStations.cache?.[lowerCaseSearch]?.name?.toLowerCase();
  
  let stationName = nameByShort ? nameByShort: nameByLong;
  if (!stationName) {
    message.channel.send([
      "FM Radio station name not found.",
      'Defaulting to `Lugna Favoriter`',
      [
        `type ${basicInfo.prefix}`,
        `${(this.aliases.join && this.aliases.join("|")) ?? this.aliases} `,
        "to se available stations"
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
    stream: radioStations.stream(fmLink),
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
  
  const [ addedSong, songQueue ] = handleVideo(args);
  
  if (addedSong) {
    addedSong.description = "✅ has been added to the queue! ✅";
    let [container, embed] = formatToEmbed(addedSong, message, false, songQueue);
    
    message.channel.send(container);
  }
  
  return;
}

module.exports = {
  name: "Play FM Radio",
  aliases: [ "radio", "fm" ],
  category: "music",
  main: radio
}