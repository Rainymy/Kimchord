function compareListsTo(userPermissions, requiredPermissions) {
  let misssingPermissions = [];
  
  for (let requiredPermission of requiredPermissions) {
    if (userPermissions.has(requiredPermission)) {
      continue; 
    }
    misssingPermissions.push(requiredPermission);
  }
  
  return misssingPermissions;
}

function checkPermissions(voiceChannel, message, requiredPermissions) {
  let Bot_permissions = voiceChannel.permissionsFor(message.client.user.id);
  return compareListsTo(Bot_permissions, requiredPermissions);
}

const PRESETS = {
  music: [ "CONNECT", "SPEAK" ]
}

module.exports = { checkPermissions, compareListsTo, PRESETS }