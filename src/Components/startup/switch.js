"use strict";
const { Message, Client } = require('discord.js');

const { validateCommandPersmissions } = require('../permission/permissions.js');
const init = require('./init.js').default;
const [commands, status] = init.init().commands();
console.table(status);

/**
* @typedef {import("discord.js").OmitPartialGroupDMChannel<Message>} OmittedMessage
* @typedef {import("../../BasicInfo.js").BasicInfo} BasicInfo
*/

/**
*
* @param {OmittedMessage} message
* @param {BasicInfo} basicInfo
* @param {String} arg searchString
* @param {*} serverQueue
* @param {String} comCall
* @param {Client} client
* @returns
*/
async function exec_command(message, basicInfo, arg, serverQueue, comCall, client) {
  const command = comCall.toLowerCase();

  if (typeof commands[command]?.main !== "function") {
    return message.channel.send("Command not found...");
  }

  const permissions = commands[command].permissions;
  const hasPermission = validateCommandPersmissions(message, client, permissions, basicInfo);

  if (hasPermission === null) { return; }
  if (hasPermission?.length) { return message.channel.send(hasPermission.join("")); }

  if (command === "help") {
    return commands[command].main(message, basicInfo, arg, status);
  }

  return commands[command].main(message, basicInfo, arg, serverQueue, client);
}

module.exports = { exec_command }
