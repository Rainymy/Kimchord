async function disconnect(client, erMsg, code) {
  console.log("Disconnect CODE: ", code);
  console.log("ERROR MESSAGE From disconnect: ", erMsg);
  client.connect();
}

module.exports = disconnect;