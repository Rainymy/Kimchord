"use strict";
const { server } = require('../../config.json');
const path = require('node:path');

const helmet = require('helmet');
const express = require('express');

const cookieParser = require('cookie-parser');

function setMiddlewares(app) {
  app.use(cookieParser());
  
  app.use(helmet.contentSecurityPolicy({
    directives: {
      "script-src": [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        `${server.location}:${server.port}`,
        "https://cdn.skypack.dev",
        "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.5.1/socket.io.js"
      ]
    }
  }));
  app.use(helmet.crossOriginEmbedderPolicy());
  app.use(helmet.crossOriginOpenerPolicy());
  app.use(helmet.crossOriginResourcePolicy());
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.frameguard());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.hsts());
  app.use(helmet.ieNoOpen());
  app.use(helmet.noSniff());
  app.use(helmet.originAgentCluster());
  app.use(helmet.permittedCrossDomainPolicies());
  app.use(helmet.referrerPolicy());
  app.use(helmet.xssFilter());
  
  app.use(express.static(path.join(__dirname, "../")));
  app.use(express.json());
  
  return app;
}

module.exports = setMiddlewares;