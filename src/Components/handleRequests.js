const request = require('./request.js');
const { parseSearchString } = require('./parseSearchString.js');

const { server } = require("../../config.json");
const { Readable } = require('node:stream');

const BASE_URL = `${server.location}:${server.port}`;

function createEmptyReadableStream() {
  const emptyStream = new Readable();
  emptyStream.push("");
  emptyStream.push(null);
  
  return emptyStream;
}

async function ping(sendTime) {
  const options = { method: "GET", headers: { "Content-type": "application/json" } }
  
  return await request(`${BASE_URL}/ping?time=${sendTime}`, options);
}

async function parseSearchStringFunction(message, searchString) {
  return await parseSearchString(message, BASE_URL, searchString);
}

async function parseRequest(param) {
  return await request(`${BASE_URL}/request`, param);
}

async function getRequestSong(param) {
  const response = await request(`${BASE_URL}/songs`, param);
  
  if (response.error) {
    return {
      error: true,
      comment: response.comment,
      emptyReadableStream: createEmptyReadableStream()
    }
  }
  
  return response;
}

async function getDuration(param) {
  return await request(`${BASE_URL}/getDuration`, param);
}

module.exports = {
  ping: ping,
  parseSearchString: parseSearchStringFunction,
  request: parseRequest,
  getRequestSong: getRequestSong,
  getDuration: getDuration,
  createEmptyReadableStream: createEmptyReadableStream
}