"use strict";
const { codeBlock } = require('../embed/markup.js');
const messageInfo = require('../message/messageInfo.js');

const { GatewayIntentBits, PermissionFlagsBits } = require("discord.js");

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
  server_mods: [PermissionFlagsBits.ManageGuild],
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

function compareListsTo(userPermissions, requiredPermissions) {
  let misssingPermissions = [];

  for (let requiredPermission of requiredPermissions) {
    if (userPermissions.has(requiredPermission)) { continue; }
    misssingPermissions.push(requiredPermission);
  }

  return misssingPermissions;
}

function checkPermissions(channel, user_id, requiredPermissions) {
  const bot_permissions = channel.permissionsFor(user_id);
  return compareListsTo(bot_permissions, requiredPermissions);
}

function validatePermissions(channel, id, requiredPermissions) {
  const neededPermissions = checkPermissions(channel, id, requiredPermissions);
  const batch = [];

  if (neededPermissions.includes(PRESETS.label.sendText)) {
    return { error: true, comment: '"SEND_MESSAGES" needed', stop: true };
  }

  for (let neededPermission of neededPermissions) {
    batch.push(`I need permission for "${neededPermission.split("_").join(" ")}".`);
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

function validateUserPermissions(user, requiredPermissions) {
  const batch = [];

  for (let permission of requiredPermissions) {
    if (user.permissions.has(permission)) { continue; }
    if (permission === "MANAGE_GUILD") { permission = "MANAGE_SERVER"; }

    batch.push(`You need "${permission.split("_").join(" ")}" permission.`);
  }

  if (batch.length > 0) {
    return { error: true, comment: codeBlock(batch.join("\n"), "js") }
  }

  return { error: false, comment: null };
}

function checkServerMusicRole(guilds_settings, member) {
  const user_roles = member.roles.cache.map(r => r.name).slice(0, -1);
  const REQUIRED_ROLE_NAME = guilds_settings.REQUIRED_MUSIC_ROLE_NAME;
  const REQUIRE_MUSIC_ROLE = guilds_settings.REQUIRE_MUSIC_ROLE;

  return user_roles.indexOf(REQUIRED_ROLE_NAME) === -1 && REQUIRE_MUSIC_ROLE;
}

function getVoicePermission(message, bot_id) {
  const voiceChannel = getConnectedVoice(message);
  if (!voiceChannel) { return [messageInfo.notInVoiceChannel]; }

  return checkPermissions(voiceChannel, bot_id, PRESETS.music);
}

function getConnectedVoice(message) {
  return message.member.voice.channel;
}

function validateCommandPersmissions(message, client, permissions, metadata) {
  if (!permissions) { return; }

  // [ 3, 1, 2, 4 ] => [ 1, 2, 3, 4 ]: small to big.
  for (let permission of permissions.sort((a, b) => a - b)) {
    if (permission === PRESETS.PERMISSIONS.CONNECT_REQUIRED) {
      if (!getConnectedVoice(message)) { return [messageInfo.notInVoiceChannel]; }
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
