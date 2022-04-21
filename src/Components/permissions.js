const { codeBlock } = require('./markup.js');

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
  
  if (neededPermissions.includes("SEND_MESSAGES")) {
    return { error: true, comment: null, stop: true };
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
    if (permission === "MANAGE_GUILD") { permission = "MANAGE SERVER"; }
    
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

const PRESETS = {
  music: [ "CONNECT", "SPEAK" ],
  channel: [ "SEND_MESSAGES", "VIEW_CHANNEL", "EMBED_LINKS", "ATTACH_FILES" ],
  server_mods: [ "MANAGE_GUILD" ],
  intents: [
    "GUILDS",
    "GUILD_VOICE_STATES",
    "GUILD_MESSAGES",
    "GUILD_MESSAGE_REACTIONS",
    "DIRECT_MESSAGES",
  ]
}

module.exports = {
  compareListsTo: compareListsTo,
  checkPermissions: checkPermissions,
  validatePermissions: validatePermissions,
  validateUserPermissions: validateUserPermissions,
  checkServerMusicRole: checkServerMusicRole,
  PRESETS: PRESETS
}

// ------------------------------ PERMISSIONS ------------------------------ //
// {
//   FLAGS: {
//     CREATE_INSTANT_INVITE: 1n,
//     KICK_MEMBERS: 2n,
//     BAN_MEMBERS: 4n,
//     ADMINISTRATOR: 8n,
//     MANAGE_CHANNELS: 16n,
//     MANAGE_GUILD: 32n,
//     ADD_REACTIONS: 64n,
//     VIEW_AUDIT_LOG: 128n,
//     PRIORITY_SPEAKER: 256n,
//     STREAM: 512n,
//     VIEW_CHANNEL: 1024n,
//     SEND_MESSAGES: 2048n,
//     SEND_TTS_MESSAGES: 4096n,
//     MANAGE_MESSAGES: 8192n,
//     EMBED_LINKS: 16384n,
//     ATTACH_FILES: 32768n,
//     READ_MESSAGE_HISTORY: 65536n,
//     MENTION_EVERYONE: 131072n,
//     USE_EXTERNAL_EMOJIS: 262144n,
//     VIEW_GUILD_INSIGHTS: 524288n,
//     CONNECT: 1048576n,
//     SPEAK: 2097152n,
//     MUTE_MEMBERS: 4194304n,
//     DEAFEN_MEMBERS: 8388608n,
//     MOVE_MEMBERS: 16777216n,
//     USE_VAD: 33554432n,
//     CHANGE_NICKNAME: 67108864n,
//     MANAGE_NICKNAMES: 134217728n,
//     MANAGE_ROLES: 268435456n,
//     MANAGE_WEBHOOKS: 536870912n,
//     MANAGE_EMOJIS_AND_STICKERS: 1073741824n,
//     USE_APPLICATION_COMMANDS: 2147483648n,
//     REQUEST_TO_SPEAK: 4294967296n,
//     MANAGE_THREADS: 17179869184n,
//     USE_PUBLIC_THREADS: 34359738368n,
//     USE_PRIVATE_THREADS: 68719476736n,
//     USE_EXTERNAL_STICKERS: 137438953472n
//   },
//   ALL: 266287972351n,
//   DEFAULT: 104324673n,
//   STAGE_MODERATOR: 20971536n,
//   defaultBit: 0n
// }