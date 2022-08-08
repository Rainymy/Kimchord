const request = require('./request.js');

function RadioStations() {
  const options = { method: "GET", headers: { "Content-type": "application/json" } }
  const base = "https://cdn.khz.se";
  
  this.getAllRadioStations = async () => {
    let stations = await request(`${base}/api/v2/channel/`, options);
    
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
  
  this.get = async (id) => await request(`${base}/api/v2/channel/${id}`, options);
  
  this.stream = async (urlString) => { return await request(urlString, options); }
  
  this.thumbnail = (img) => { return `${base}/images/250x250/${img}`; }
  
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