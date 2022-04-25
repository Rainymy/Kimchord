const stateChange = {
  userLeftOrChangedChannel: function (oldState, newState, client) {
    if (!oldState?.channelId) { return false; }
    if (newState.channelId === oldState.channelId) { return false; }
    if (newState.id === client.user.id) { return false; }
    
    return true;
  },
  isBotMoved: function (oldState, newState) {
    if (!oldState?.channelId) { return false; }
    if (!newState?.channelId) { return false; }
    if (oldState.channelId === newState.channelId) { return false; }
    
    return true;
  },
  isBotLeft: function (oldState, newState) {
    if (newState.channelId) { return false; }
    
    return true;
  }
}
const helpers = {
  getVoicechannel: function (connection, client) {
    const guild = client.guilds.cache.get(connection.guildId);
    const voicechannel = guild.channels.cache.get(connection.channelId);
    
    return voicechannel;
  },
  isAloneInVoicechannel: function (user_id, channel) {
    return channel.members.get(user_id) && channel.members.size === 1;
  },
  cleanLeave: function (queue, guild_id) {
    const serverQueue = queue.get(guild_id);
    
    clearTimeout(serverQueue.timeout.id);
    serverQueue.connection.destroy();
    return queue.delete(guild_id);  
  }
}

async function voiceStateUpdate(oldState, newState, client, queue) {
  
  if (stateChange.userLeftOrChangedChannel(oldState, newState, client)) {
    const serverQueue = queue.get(oldState.guild.id);
    if (!serverQueue) { return; }
    
    console.log(oldState.guild.name);
    
    const connection = serverQueue.connection.joinConfig;
    const voicechannel = helpers.getVoicechannel(connection, client);
    
    if (!helpers.isAloneInVoicechannel(client.user.id, voicechannel)) { return; }
    
    serverQueue.textChannel.send(`😢 Everybody just left me 😢`)
    .catch(e => printToTerminal('ERROR from "voiceStateUpdate"', e));
    
    return helpers.cleanLeave(queue, oldState.guild.id);
  }
  
  if (stateChange.isBotMoved(oldState, newState)) {
    const serverQueue = queue.get(oldState.guild.id);
    if (!serverQueue) { return; }
    
    const connection = serverQueue.connection.joinConfig;
    const voicechannel = helpers.getVoicechannel(connection, client);
    
    if (!helpers.isAloneInVoicechannel(client.user.id, voicechannel)) { return; }
    
    serverQueue.textChannel.send(`Somebody gotta be there to catch me`)
    .catch(e => printToTerminal('ERROR from "voiceStateUpdate"', e));
    
    return helpers.cleanLeave(queue, oldState.guild.id);
  }
  
  if (stateChange.isBotLeft(oldState, newState)) {
    const serverQueue = queue.get(oldState.guild.id);
    if (!serverQueue) { return; }
    
    serverQueue.textChannel.send(
      `${client.user.username} disconnected by an user action 😔`
    )
    .catch(e => printToTerminal('ERROR from "voiceStateUpdate"', e));
    
    return helpers.cleanLeave(queue, oldState.guild.id);
  }
}

module.exports = voiceStateUpdate;