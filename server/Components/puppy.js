"use strict";
const puppeteer = require('puppeteer');
const path = require('node:path');

const { writeFile } = require('./handleFile.js');

function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds));
}

function waitUntilToken(page) {
  return new Promise(function(resolve, reject) {
    page.on('request', interceptedRequest => {
      const headers = interceptedRequest.headers();
      
      if (!headers["x-youtube-identity-token"]) { return; }
      resolve(headers["x-youtube-identity-token"]);
    });
  });
}

async function login(email, password) {
  if (!email || !password) {
    return console.log(`Login detail - ${(!email ? "Email":"Password")} is missing.`);
  }
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://accounts.google.com/signin/v2/identifier", {
    waitUntil: "networkidle2"
  });

  await page.type("#identifierId", email);
  await page.click("#identifierNext");
  
  await page.waitForSelector("#password", { visible: true, hidden: false, });
  
  await page.type(
    "#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input", password
  );
  
  await sleep(1000);
  await page.click("#passwordNext > div > button");
  
  await sleep(1000);
  await page.goto("https://www.youtube.com/", { waitUntil: "networkidle2", });
  
  const isLoggedIn = await page.evaluate(() => {
    return document.querySelector("#buttons > ytd-button-renderer > a");
  });
  
  if (!isLoggedIn) {
    await browser.close();
    return "Login failed - login detail is wrong (email/password).";
  }
  
  const auth = {
    cookies: await page.cookies(),
    identityToken: await waitUntilToken(page)
  }
  
  const authString = JSON.stringify(auth, null, 2);
  const pathFile = path.join(__dirname, "../cookies.json");
  
  await writeFile(pathFile, authString, (err) => {
    if (err) { return console.log(err); }
    return console.log("Succesfully logged in and saved cookies.");
  });
  
  await browser.close();
  return auth;
}

module.exports = {
  login: login
}