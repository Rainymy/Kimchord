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
  
  for (let neededPermission of neededPermissions) {
    if (neededPermission === "SEND_MESSAGES") {
      return { error: true, comment: null, stop: true };
    }
    
    batch.push(
      `I need permission for "${neededPermission.split("_").join(" ")}".`
    );
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

const PRESETS = {
  music: [ "CONNECT", "SPEAK" ],
  channel: [ "SEND_MESSAGES", "VIEW_CHANNEL", "EMBED_LINKS", "ATTACH_FILES" ]
}

module.exports = {
  checkPermissions,
  validatePermissions,
  compareListsTo,
  PRESETS
}