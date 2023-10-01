"use strict";
const request = require('./request.js');
const { createEmptyReadableStream, isObject } = require('../util/util.js');

const { server } = require("../../../config.json");
const BASE_URL = `${server.location}:${server.port}`;

async function ping(sendTime) {
  const options = { method: "GET", headers: { "Content-type": "application/json" } }

  return await request(`${BASE_URL}/ping?time=${sendTime}`, options);
}

async function parseSearchString(message, searchString) {
  const [param, request_object] = createRequestParam(message.author, searchString);

  const response = await request(`${BASE_URL}/parseSearchString`, param);

  if (response.error) { return [ null, null, response.comment ]; }
  if (!isObject(response) && !response?.length) { return [ null, null, true ]; }

  const video = response.type === "playlist" ? response : [ response ];

  request_object.videoData = video;
  delete request_object.inputQuery;

  param.body = JSON.stringify(request_object);
  return [ param, video, false ];
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

async function deleteRequest(param) {
  const data = await request(`${BASE_URL}/remove`, param);

  if (!data.error) { return data.comment }
  if (data.comment.errno === (-4058)) { return data.comment.errno; }

  return data.comment;
}

function createRequestParam(author, searchString) {
  const request_object = {
    username: author.username,
    userId: author.id,
    inputQuery: searchString
  }

  const param = {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(request_object)
  }

  return [ param, request_object ];
}

function softCloneRequest(param) {
  return JSON.parse(JSON.stringify(param));
}

function modifyRequestBody(oldParam, param) {
  const temp = JSON.parse(oldParam.body);
  temp.videoData = param;
  oldParam.body = temp;
  oldParam.isStream = param?.isLive ?? false;

  return oldParam;
}

module.exports = {
  handleRequests: {
    ping: ping,
    parseSearchString: parseSearchString,
    request: parseRequest,
    getRequestSong: getRequestSong,
    deleteRequest: deleteRequest
  },
  createEmptyReadableStream: createEmptyReadableStream,
  softCloneRequest: softCloneRequest,
  modifyRequestBody: modifyRequestBody
}
