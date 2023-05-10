"use strict";
const { PRESETS } = require('../../Components/permissions.js');

const request = require('../../Components/request.js');
const { parseSearchString } = require('../../Components/parseSearchString.js');
const messageInfo = require('../../Components/messageInfo.js');

async function deleteSong(message, basicInfo, searchString, queue) {
  if (!basicInfo.isDev) { return; }
  
  const baseUrl = basicInfo.server.URL;
  
  const [param,, failed] = await parseSearchString(message, baseUrl, searchString);
  if (failed) { return message.channel.send(messageInfo.foundNoSearchResults); }
  
  const data = await request(`${baseUrl}/remove`, param);
  
  if (!data.error) { return message.channel.send(data.comment); }
  
  if (data.comment.errno === (-4058)) {
    return message.channel.send(messageInfo.doesNotExist);
  }
  
  console.log("delete data: ", data);
  return message.channel.send(
    messageInfo.ERROR_CODE(data.comment.errno.toString())
  );
}

module.exports = {
  name: "Delete", 
  permissions: [
    PRESETS.PERMISSIONS.TEXT
  ],
  aliases: "delete",
  main: deleteSong,
  isHidden: true
}