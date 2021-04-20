const { DeviceType } = require('../models');
const { makeRes, to } = require('../utils/helpers');

/**
 * List all the available device types.
 * 
 * @param {Object|undefined} req 
 * @param {Object} res 
 */
const list = async (req, res) => {
  let err, deviceTypes;
  [err, deviceTypes] = await to(DeviceType.findAll({
    attributes: ['id', 'name']
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  return res.status(200).send(makeRes('Device types retrieved.', { deviceTypes }));
}

module.exports = {
  list
};