function isBotLeft(oldState, newState) {
  if (newState.channelId) { return false; }
  
  return true;
}

function isBotMoved(oldState, newState) {
  if (!oldState?.channelId) { return false; }
  if (!newState?.channelId) { return false; }
  if (oldState.channelId === newState.channelId) { return false; }
  
  return true;
}

function userLeftOrChangedChannel(oldState, newState, client) {
  if (!oldState?.channelId) { return false; }
  if (newState.channelId === oldState.channelId) { return false; }
  if (newState.id === client.user.id) { return false; }
  
  return true;
}

function getVoicechannel(connection, client) {
  const guild = client.guilds.cache.get(connection.guildId);
  const voicechannel = guild.channels.cache.get(connection.channelId);
  
  return voicechannel;
}

function isAloneInVoicechannel(user_id, channel) {
  return channel.members.get(user_id) && channel.members.size === 1;
}

async function voiceStateUpdate(oldState, newState, client, queue) {
  if (oldState?.guild?.name) { console.log(oldState.guild.name); }
  
  if (userLeftOrChangedChannel(oldState, newState, client)) {
    const serverQueue = queue.get(oldState.guild.id);
    if (!serverQueue) { return; }
    
    const voicechannel = getVoicechannel(serverQueue.connection.joinConfig, client);
    
    if (!isAloneInVoicechannel(client.user.id, voicechannel)) { return; }
    
    serverQueue.textChannel.send(`😢 Everybody just left me 😢`)
    .catch(e => printToTerminal('ERROR from "voiceStateUpdate"', e));
    
    serverQueue.connection.destroy();
    return queue.delete(oldState.guild.id);
  }
  
  if (isBotMoved(oldState, newState)) {
    const serverQueue = queue.get(oldState.guild.id);
    if (!serverQueue) { return; }
    
    const voicechannel = getVoicechannel(serverQueue.connection.joinConfig, client);
    
    if (!isAloneInVoicechannel(client.user.id, voicechannel)) { return; }
    
    serverQueue.textChannel.send(`Somebody gotta be there to catch me`)
    .catch(e => printToTerminal('ERROR from "voiceStateUpdate"', e));
    
    serverQueue.connection.destroy();
    return queue.delete(oldState.guild.id);
  }
  
  if (isBotLeft(oldState, newState)) {
    const serverQueue = queue.get(oldState.guild.id);
    if (!serverQueue) { return; }
  
    serverQueue.textChannel.send(
      `${client.user.username} disconnected by an user action 😔`
    )
    .catch(e => printToTerminal('ERROR from "voiceStateUpdate"', e));
  
    serverQueue.connection.destroy();
    return queue.delete(oldState.guild.id);  
  }
}

module.exports = voiceStateUpdate;

// {
//   isBotLeft: isBotLeft,
//   isBotMoved: isBotMoved,
//   userLeftOrChangedChannel: userLeftOrChangedChannel,
//   getVoicechannel: getVoicechannel,
//   isAloneInVoicechannel: isAloneInVoicechannel
// }