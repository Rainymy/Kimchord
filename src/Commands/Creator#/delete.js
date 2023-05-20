"use strict";
const { PRESETS } = require('../../Components/permissions.js');

const request = require('../../Components/request.js');
const { handleRequests } = require('../../Components/handleRequests.js');
const messageInfo = require('../../Components/messageInfo.js');

async function deleteSong(message, basicInfo, searchString, queue) {
  if (!basicInfo.isDev) { return; }
  
  const [
    param,, failed
  ] = await handleRequests.parseSearchString(message, searchString);
  
  if (typeof failed === "string") { return message.channel.send(failed); }
  if (failed) { return message.channel.send(messageInfo.foundNoSearchResults); }
  
  const result = await handleRequests.deleteRequest(param);
  
  if (typeof result === "string") {
    return message.channel.send(result);
  }
  
  if (result === (-4058)) {
    return message.channel.send(messageInfo.doesNotExist);
  }
  
  console.log("delete data: ", data);
  return message.channel.send(messageInfo.ERROR_CODE(result.errno.toString()));
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