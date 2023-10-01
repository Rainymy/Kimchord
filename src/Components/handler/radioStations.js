const request = require('./request.js');

function RadioStations() {
  const options = { method: "GET", headers: { "Content-type": "application/json" } }
  const BASE_URL = "https://cdn.khz.se";
  const CHANNEL_URL = `${BASE_URL}/api/v2/channel`;
  const THUMBNAIL_URL = `${BASE_URL}/images/250x250`;
  
  this.getAllRadioStations = async () => {
    const stations = await request(`${CHANNEL_URL}`, options);
    
    for (let station of stations) {
      this.cache[station.name.toLowerCase()] = station;
      
      let temp = [];
      for (let name of station.name.split(" ")) {
        temp.push(name.charAt(0).toLowerCase());
      }
      this.shorts[temp.join("").toLowerCase()] = station.name.toLowerCase();
    }
    
    this.isCached = true;
    return this;
  }
  
  this.save = (data) => { return; }
  
  this.get = async (id) => await request(`${CHANNEL_URL}/${id}`, options);
  
  this.stream = async (urlString) => {
    return await request(urlString, { ...options, isStream: true });
  }
  
  this.thumbnail = (img) => { return `${THUMBNAIL_URL}/${img}`; }
  
  this.update = async (id) => {
    const currnet_info = await this.get(id);
    return {
      title: `${currnet_info.name}: ${currnet_info.currentsong.song.title}`,
      duration: parseInt(currnet_info.currentsong.run_length),
      thumbnail: this.thumbnail(currnet_info.currentsong.song.cover_art)
    }
  }
  
  this.isCached = false;
  this.cache = [];
  this.shorts = {};
}

module.exports = new RadioStations();