// Mock for p-limit that simulates concurrency limiting
module.exports = function pLimit(concurrency) {
  let activeCount = 0;
  const queue = [];
  
  const run = async (fn) => {
    if (activeCount < concurrency) {
      activeCount++;
      try {
        const result = await fn();
        activeCount--;
        if (queue.length > 0) {
          const next = queue.shift();
          next.resolve(run(next.fn));
        }
        return result;
      } catch (error) {
        activeCount--;
        if (queue.length > 0) {
          const next = queue.shift();
          next.resolve(run(next.fn));
        }
        throw error;
      }
    } else {
      return new Promise((resolve, reject) => {
        queue.push({ fn, resolve, reject });
      });
    }
  };
  
  return run;
};