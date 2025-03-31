"use strict";
const { codeBlock } = require('../embed/markup.js');
const messageInfo = require('../message/messageInfo.js');

const {
  GatewayIntentBits,
  PermissionFlagsBits,
  Message,
  PermissionsBitField,
  Client,
  GuildMember
} = require("discord.js");

/**
* @typedef {import("discord.js").OmitPartialGroupDMChannel<Message>} OmittedMessage
* @typedef {import("discord.js").VoiceBasedChannel} VoiceBasedChannel
* @typedef {import("../../BasicInfo.js").BasicInfo} BasicInfo
* @typedef {import("../startup/guildData.js").GuildData} GuildData
*/

const PRESETS = {
  music: [
    PermissionFlagsBits.Connect,
    PermissionFlagsBits.Speak
  ],
  channel: [
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles
  ],
  server_mods: [
    PermissionFlagsBits.ManageGuild
  ],
  label: {
    sendText: PermissionFlagsBits.SendMessages
  },
  // this permission is for my own;
  PERMISSIONS: {
    // Order of permission check: [1 = important], [10 = check later]
    MUSIC: 4,
    TEXT: 1,
    CONNECT_REQUIRED: 2,
    ROLE_REQUIRED: 3
  },
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ]
}

/**
*
* @param {Readonly<PermissionsBitField>} userPermissions
* @param {BigInt[]} requiredPermissions
* @returns
*/
function compareListsTo(userPermissions, requiredPermissions) {
  let misssingPermissions = [];

  for (let requiredPermission of requiredPermissions) {
    // @ts-ignore
    if (userPermissions.has(requiredPermission)) { continue; }
    misssingPermissions.push(requiredPermission);
  }

  return misssingPermissions;
}

/**
*
* @param {VoiceBasedChannel} channel
* @param {String} user_id
* @param {BigInt[]} requiredPermissions
* @returns
*/
function checkPermissions(channel, user_id, requiredPermissions) {
  const bot_permissions = channel.permissionsFor(user_id);
  return compareListsTo(bot_permissions, requiredPermissions);
}

/**
*
* @param {VoiceBasedChannel} channel
* @param {String} id
* @param {BigInt[]} requiredPermissions
* @returns
*/
function validatePermissions(channel, id, requiredPermissions) {
  const neededPermissions = checkPermissions(channel, id, requiredPermissions);
  const batch = [];

  if (neededPermissions.includes(PRESETS.label.sendText)) {
    return {
      error: true,
      comment: '"SEND_MESSAGES" needed',
      stop: true
    };
  }

  for (let neededPermission of neededPermissions) {
    batch.push(`I need permission for "${neededPermission}".`);
  }

  if (batch.length > 0) {
    return {
      error: true,
      comment: codeBlock(
        `${batch.join("\n")}\n - make sure I have the proper permissions!`, "js"
      )
    };
  }

  return { error: false, comment: null }
}

/**
*
* @param {GuildMember} user
* @param {BigInt[]} requiredPermissions
* @returns
*/
function validateUserPermissions(user, requiredPermissions) {
  const batch = [];

  for (let permission of requiredPermissions) {
    // @ts-ignore
    if (user.permissions.has(permission)) { continue; }
    // if (permission === "MANAGE_GUILD") {
    //   permission = "MANAGE_SERVER"; // need to fix this;
    // }

    batch.push(`You need "${permission}" permission.`);
  }

  if (batch.length > 0) {
    return { error: true, comment: codeBlock(batch.join("\n"), "js") }
  }

  return { error: false, comment: null };
}

/**
*
* @param {GuildData} guilds_settings
* @param {GuildMember} member
* @returns
*/
function checkServerMusicRole(guilds_settings, member) {
  const user_roles = member.roles.cache.map(r => r.name).slice(0, -1);
  const REQUIRED_ROLE_NAME = guilds_settings.REQUIRED_MUSIC_ROLE_NAME;
  const REQUIRE_MUSIC_ROLE = guilds_settings.REQUIRE_MUSIC_ROLE;

  return user_roles.indexOf(REQUIRED_ROLE_NAME) === -1 && REQUIRE_MUSIC_ROLE;
}

/**
*
* @param {OmittedMessage} message
* @param {String} bot_id
* @returns
*/
function getVoicePermission(message, bot_id) {
  const voiceChannel = getConnectedVoice(message);
  if (!voiceChannel) { return [messageInfo.notInVoiceChannel]; }

  return checkPermissions(voiceChannel, bot_id, PRESETS.music);
}

/**
* @param {OmittedMessage} message
* @returns
*/
function getConnectedVoice(message) {
  return message.member.voice.channel;
}

/**
*
* @param {OmittedMessage} message
* @param {Client} client
* @param {Number[]} permissions
* @param {BasicInfo} metadata
* @returns
*/
function validateCommandPersmissions(message, client, permissions, metadata) {
  if (!permissions) { return; }

  // [ 3, 1, 2, 4 ] => [ 1, 2, 3, 4 ]: small to big.
  for (let permission of permissions.sort((a, b) => a - b)) {
    if (permission === PRESETS.PERMISSIONS.CONNECT_REQUIRED) {
      if (!getConnectedVoice(message)) {
        return [messageInfo.notInVoiceChannel];
      }
      continue;
    }

    if (permission === PRESETS.PERMISSIONS.MUSIC) {
      const perms = getVoicePermission(message, client.user.id);

      if (perms.length) {
        return [messageInfo.permissionNeeded(perms.join(", "))];
      }

      continue;
    }

    if (permission === PRESETS.PERMISSIONS.ROLE_REQUIRED) {
      const guilds_settings = metadata.guilds_settings;
      const REQUIRED_ROLE_NAME = guilds_settings.REQUIRED_MUSIC_ROLE_NAME;

      if (checkServerMusicRole(guilds_settings, message.member)) {
        return [
          codeBlock(
            [
              `Requires "${REQUIRED_ROLE_NAME}" role.`,
              [
                `You can disable this with`,
                `"${guilds_settings.prefix}settings REQUIRE_MUSIC_ROLE false"`
              ].join(" ")
            ].join("\n"),
            "js"
          )
        ];
      }

      continue;
      // if PRESETS.PERMISSIONS.ROLE_REQUIRED - END
    }

    if (permission === PRESETS.PERMISSIONS.TEXT) {
      const res = validatePermissions(
        // @ts-ignore
        message.channel, client.user.id, PRESETS.channel
      );

      if (res.stop || res.error) { return res.stop ? null : [res.comment]; }
    }

    continue;
  }

  return [];
}

module.exports = {
  PRESETS: PRESETS,
  validateUserPermissions: validateUserPermissions,
  validateCommandPersmissions: validateCommandPersmissions
}
