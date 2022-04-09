const { formatToEmbed } = require('../../Components/formatToEmbed.js');
const { parseSearchString } = require('../../Components/parseSearchString.js');
const { checkServerMusicRole } = require('../../Components/permissions.js');

const messageInfo = require('../../Components/messageInfo.js');
const { codeBlock } = require('../../Components/markup.js');

async function searchVideo(message, basicInfo, searchString, queue) {
  const baseUrl = basicInfo.serverURL;
  const [, video, failed] = await parseSearchString(message, baseUrl, searchString);
  if (failed) { return message.channel.send(messageInfo.foundNoSearchResults); }
  
  video[0].requestedBy = message.author;
  const [ container, embed ] = formatToEmbed(video[0], true);
  embed.description = messageInfo.foundSearchResult;
  
  return message.channel.send(container);
}

module.exports = {
  name: "Search",
  aliases: ["search"],
  main: searchVideo
}