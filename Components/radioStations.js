const request = require('./request');

function RadioStations() {
  
  const options = {
    method: "GET", 
    headers: {
      "Content-type": "application/json"
    }
  }
  
  this.getAllRadioStations = async () => {
    let stations = await request("https://app.khz.se/api/v2/channel/", options);
    
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
  this.save = (data) => {
    
  }
  
  this.get = async (id) => {
    let station = await request(`https://app.khz.se/api/v2/channel/${id}`, options);
    return station;
  }
  
  this.stream = async (urlString) => {
    let station = await request(urlString, options);
    return station;
  }
  
  this.thumbnail = (img) => {
    return `https://cdn.khz.se/images/250x250/${img}`;
  }
  
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