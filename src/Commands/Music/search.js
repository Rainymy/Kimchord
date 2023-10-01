"use strict";
const { PRESETS } = require('../../Components/permission/permissions.js');

const { formatToEmbed } = require('../../Components/embed/formatToEmbed.js');
const { handleRequests } = require('../../Components/handler/handleRequests.js');

const messageInfo = require('../../Components/message/messageInfo.js');
const { codeBlock } = require('../../Components/embed/markup.js');

async function searchVideo(message, basicInfo, searchString, queue) {
  const [
    , video, failed
  ] = await handleRequests.parseSearchString(message, searchString);

  if (typeof failed === "string") { return message.channel.send(failed); }
  if (failed) { return message.channel.send(messageInfo.foundNoSearchResults); }

  video[0].requestedBy = message.author;
  const [ container, embed ] = formatToEmbed(video[0], true);
  embed.description = messageInfo.foundSearchResult;

  return message.channel.send(container);
}

module.exports = {
  name: "Search",
  permissions: [
    PRESETS.PERMISSIONS.TEXT
  ],
  aliases: ["search"],
  main: searchVideo
}
