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
  
  const response = await request(`${BASE_URL}/ping?time=${sendTime}`, options);
  return response;
}

async function parseSearchStringFunction(message, searchString) {
  const response = await parseSearchString(message, BASE_URL, searchString);
  return response;
}

async function parseRequest(param) {
  const response = await request(`${BASE_URL}/request`, param);
  return response;
}

async function download(param) {
  const response = await request(`${BASE_URL}/download`, param);
  return response;
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
  download: download,
  getRequestSong: getRequestSong,
  getDuration: getDuration,
  createEmptyReadableStream: createEmptyReadableStream
}