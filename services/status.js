const CacheService = require('./cache');
const Status = require('../models').Status;

const cacheTtl = 60 * 60 * 1; // 1 hour
const cache = new CacheService(cacheTtl);
const idCache = new CacheService(cacheTtl);

const id = async (key) => {
  return await idCache.get(key, async () => {
    return await Status.findOne({
      attributes: ['id'],
      where: {
        key: key
      }
    })
    .then(status => status.id);
  });
}

const list = async () => {
  return await cache.get('status', async () => {
    return await Status.findAll({
      attributes: ['id', 'key', 'name']
    });
  });
}

module.exports = {
  id,
  list
};