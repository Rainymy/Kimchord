const { existsSync, readFileSync } = require('fs');
const path = require('path');
const { login } = require('./puppy.js');
const { email, password } = require('../config.json');

function Cookies() {
  this.cookiesPath = path.join(__dirname, "../cookies.json");
  
  this.exists = () => { return existsSync(this.cookiesPath); }
  
  this.login = () => {
    return new Promise((resolve, reject) => {
      return login(email, password).then(resolve).catch(reject);
    });
  }
  
  this.load = () => {
    try { return JSON.parse(readFileSync(this.cookiesPath)); }
    catch (e) { return console.log(e); }
  }
  
  this.get = async () => {
    console.log("------------------------------------------------------");
    console.log("Checking Cookies...");
    
    let cookie;
    
    try {
      if (this.exists()) {
        console.log("loading Cookies...");
        cookie = this.load();
      }
      else {
        console.log("Generating Cookie");
        cookie = await this.login();
        if (typeof cookie === "string") {
          console.log(cookie);
          cookie = null;
        }
      }
      
      if (cookie) { console.log("Cookies Ready!"); }
    }
    catch (e) {
      console.log("Error on Cookies.");
      console.log(e);
    }
    
    console.log("------------------------------------------------------");
    return cookie;
  }
  
  return this;
}

module.exports = new Cookies();