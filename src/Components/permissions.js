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
  
  if (neededPermissions.includes("SendMessages")) {
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

function validateCommandPersmissions(commands, command, message) {
  return [""];
}

const PRESETS = {
  music: [ "Connect", "Speak" ],
  channel: [ "SendMessages", "ViewChannel", "EmbedLinks", "AttachFiles" ],
  server_mods: [ "ManageGuild" ],
  intents: [
    "Guilds",
    "GuildVoiceStates",
    "GuildMessages",
    "GuildMessageReactions",
    "DirectMessages",
    "MessageContent"
  ]
}

module.exports = {
  compareListsTo: compareListsTo,
  checkPermissions: checkPermissions,
  validatePermissions: validatePermissions,
  validateUserPermissions: validateUserPermissions,
  checkServerMusicRole: checkServerMusicRole,
  validateCommandPersmissions: validateCommandPersmissions,
  PRESETS: PRESETS
}