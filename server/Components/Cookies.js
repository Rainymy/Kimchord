const { existsSync, readFileSync } = require('fs');
const path = require('path');
const { login } = require('./puppy.js');
const { email, password } = require('../config.json');

function Cookies() {
  this.exists = () => {
    return existsSync(path.join(__dirname, "../cookies.json"))
  }
  
  this.login = () => {
    return new Promise((resolve, reject) => {
      login(email, password).then(resolve).catch(reject);
    });
  }
  
  this.load = () => {
    try {
      return JSON.parse(readFileSync(path.join(__dirname, "../cookies.json")));
    }
    catch (e) { return; }
  }
  
  return this;
}

module.exports = new Cookies();