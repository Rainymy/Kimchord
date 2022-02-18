const fetch = (...args) => import('node-fetch')
.then(({default: fetch}) => fetch(...args));

async function request(httpURL, options) {
  let response = await fetch(httpURL, options);
  let clone = response.clone();
  
  async function handleJSON() {
    return await new Promise(function(resolve, reject) {
      clone.json()
        .then(event => resolve(event))
        .catch(e => resolve(null));
    });
  }
  
  async function preserveStream() { return response; }
  
  const result = await Promise.all([handleJSON(), preserveStream()]);
  
  if (!result[0]) { return result[1]; }
  return result[0];
}

module.exports = request;