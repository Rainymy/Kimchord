"use strict";
async function pingEvent(req, res, GLOBAL_OBJECTS) {
  return res.send({ time: Date.now() });
}

module.exports = {
  method: "get",
  route: "/ping",
  skipLoad: false,
  main: pingEvent
};