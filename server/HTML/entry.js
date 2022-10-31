"use strict";

import Custom_Socket from './util/socket.js';

const WEB_SOCKET_URI = `ws://${window.location.host}/WS`;

const io = Custom_Socket.createSocket(WEB_SOCKET_URI);

function createButton(text, callback) {
  const button = document.createElement("button");
  button.textContent = text;
  button.onclick = callback;
  
  return button;
}

const container = document.querySelector(".nav") || document.body;

const close_button = createButton("close", Custom_Socket.closeSocket);
const open_button = createButton("open", () => Custom_Socket.createSocket(WEB_SOCKET_URI));
const reconnect_button = createButton("reconnect", Custom_Socket.reconnectSocket);

container.appendChild(close_button);
container.appendChild(open_button);
container.appendChild(reconnect_button);

// console.log(`Opening Socket at [ ${io.url} ]`);