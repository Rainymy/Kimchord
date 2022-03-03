const { formatToEmbed } = require('../Components/formatToEmbed.js');
const { handleVideo } = require('../Components/handleVideo.js');
const { createAudioPlayer } = require('@discordjs/voice');
const request = require('../Components/request');
const radio = require('../Components/radioStations.js');

let radioStations;

async function fm(message, basicInfo, searchString, queue) {
  if (!radioStations?.isCached) {
    radioStations = await radio.getAllRadioStations();
  }
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel) {
    return message.channel.send(
      "I'm sorry but you need to be in a voice channel to play music!"
    );
  }
  
  const lowerCaseSearch = searchString?.toLowerCase();
  
  let nameByShort = radioStations.shorts?.[lowerCaseSearch];
  let nameByLong = radioStations.cache?.[lowerCaseSearch]?.name?.toLowerCase();
  
  let stationName = nameByShort ? nameByShort: nameByLong;
  if (!stationName) {
    message.channel.send([
      "FM Radio station name not found.",
      'Defaulting to `Lugna Favoriter`'
    ].join("\n"));
    stationName = "lugna favoriter";
  }
  
  const station = await radioStations.get(radioStations.cache[stationName].id);
  
  const fmLink = station.livestream[0].url;
  const response = await radioStations.stream(fmLink);
  
  if (response.error) { return message.channel.send(response.comment); }
  
  const video = {
    id: null,
    title: `${stationName}: ${station.currentsong.song.title}`,
    url: fmLink,
    duration: parseInt(station.currentsong.run_length),
    thumbnail: radioStations.thumbnail(station.currentsong.song.cover_art),
    type: "radio",
    stream: response.body,
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
  aliases: [ "fm" ],
  main: fm
}