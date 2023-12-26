"use strict";
async function main(req, res, GLOBAL_OBJECTS) {
  const { fileManager } = GLOBAL_OBJECTS;
  
  return await res.send("Main Page (POST)")
}

module.exports = {
  method: "post",
  route: "/",
  skipLoad: false,
  permissions: [],
  main: main
};