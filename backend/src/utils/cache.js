let cache = {};

const get = (key) => {
  const item = cache[key];
  if (!item) return null;
  
  if (Date.now() > item.expiry) {
    delete cache[key];
    return null;
  }
  
  return item.value;
};

const set = (key, value, minutes) => {
  const expiry = Date.now() + (minutes * 60 * 1000);
  cache[key] = { value, expiry };
};

const del = (key) => {
  delete cache[key];
};

module.exports = { get, set, del };
