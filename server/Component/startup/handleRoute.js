"use strict";
const fs = require('node:fs');
const path = require('node:path');

const { checkPermission } = require('../util/permission.js');

function getAllRoute() {
  const routes = [];
  const basePath = path.join(__dirname, "../../Routes");

  for (let routePath of fs.readdirSync(basePath)) {
    const route = require(path.join(basePath, routePath));
    if (route.skipLoad) { continue; }

    routes.push(route);
  }

  return routes;
}

function isValidMethod(method) {
  if (method === "get") { return true; }
  if (method === "post") { return true; }

  return false;
}

function loadAllRoutes(server, routes, GLOBAL_OBJECTS) {
  for (let route of routes) {
    const method = route.method?.toLowerCase();
    const apiRoute = route.route;
    const main = route.main;

    if ((!method || !apiRoute) || !main) {
      console.log("Skipping (missing values): ", route);
      continue;
    }

    if (!isValidMethod(method)) {
      console.log("Invalid method: ", `"${method}"`, route);
      continue;
    }

    server[method](apiRoute, async (req, res) => {
      const { error, comment } = checkPermission(route, req.body);

      console.log({ error, comment }, route.route);
      if (error) { return res.send({ error: error, comment: comment }); }

      try { await main(req, res, GLOBAL_OBJECTS); }
      catch (e) { res.send({ error: true, comment: "INTERNAL ERROR" }) }

      return;
    });
  }

  return;
}

module.exports = {
  getAllRoute: getAllRoute,
  loadAllRoutes: loadAllRoutes
}
