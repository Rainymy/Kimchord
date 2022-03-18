const { formatToEmbed } = require('../Components/formatToEmbed.js');
const { parseSearchString } = require('../Components/parseSearchString.js');
const messageInfo = require('../Components/messageInfo.js');

async function searchVideo(message, basicInfo, searchString, queue) {
  const baseUrl = basicInfo.serverURL;
  const [, video, failed] = await parseSearchString(message, baseUrl, searchString);
  if (failed) { return message.channel.send(messageInfo.foundNoSearchResults); }
  
  const [ container, embed ] = formatToEmbed(video[0], message, true);
  embed.description = messageInfo.foundSearchResult;
  
  return message.channel.send(container);
}

module.exports = {
  name: "Search",
  aliases: ["search"],
  category: "music",
  main: searchVideo
}