"use strict";
const { PRESETS } = require('../../Components/permission/permissions.js');

const request = require('../../Components/handler/request.js');
const { handleRequests } = require('../../Components/handler/handleRequests.js');
const messageInfo = require('../../Components/message/messageInfo.js');

async function deleteSong(message, basicInfo, searchString, queue) {
  if (!basicInfo.isDev) { return; }

  const [
    param, , failed
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

  return message.channel.send(messageInfo.ERROR_CODE(result.errno.toString()));
}

/** @type {import("../CommandModule.js").CommandModule} */
const command = {
  name: "Delete",
  permissions: [
    PRESETS.PERMISSIONS.TEXT
  ],
  aliases: "delete",
  main: deleteSong,
  isHidden: true
}

module.exports = command;
