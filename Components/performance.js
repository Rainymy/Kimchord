async function count_performance(tries = 100, cb) {
  let totalRuns = [];
  let timer;
  for (let i = 0; i < tries; i++) {
    timer = performance.now();
    await cb();
    totalRuns.push(performance.now() - timer);
  }
  
  const sortedArray = totalRuns.sort((a, b) => { return b - a; });
  const totalTime = sortedArray.reduce((acc, curr) => { return acc + curr; }, 0);
  
  return {
    max: sortedArray[0], 
    min: sortedArray[sortedArray.length - 1],
    avg: totalTime / sortedArray.length,
    data: sortedArray 
  };
}

module.exports = count_performance;