const jwt = require('jsonwebtoken');

const { Device, DeviceType } = require('../models');
const { makeRes, to, filterErrors } = require('../utils/helpers');
const status = require('../services/status');

/**
 * Add a new device to the system.
 * 
 * @param {Object} req
 * @param {Object} req.body
 * @param {Object} req.user
 * @param {Object} res
 */
const create = async (req, res) => {
  // Set device status to pending
  req.body.statusId = await status.id('pending');
  
  // Build device instance and validate
  let deviceInstance = Device.build(req.body);

  let deviceValidated;
  [err, deviceValidated] = await to(deviceInstance.validate());

  if (err) {
    return res.status(400).send(makeRes('Invalid device details.', {
      errors: err.errors ? filterErrors(err.errors) : null
    }));
  }

  // Find device type
  let deviceType;
  [err, deviceType] = await to(DeviceType.findOne({
    where: {
      id: req.body.deviceTypeId
    }
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong'));
  }

  if (!deviceType) {
    return res.status(400).send(makeRes('Device type not found.'));
  }

  // Save device
  let savedDevice;
  [err, savedDevice] = await to(deviceInstance.save());

  if (err) {
    return res.status(500).send(makeRes('Unable to add new device.', {
      errors: err.errors ? filterErrors(err.errors) : null
    }));
  }

  [err, deviceType] = await to(deviceType.addDevice(savedDevice));

  if (err) {
    return res.status(500).send(makeRes('Unable to add new device.'));
  }

  // Generate JWT with device ID
  const secret = process.env.JWT_DEVICE_SECRET_KEY
  const opts = {};

  const token = jwt.sign({ id: savedDevice.id }, secret, opts);

  return res.status(200).send(makeRes('Device registered.', {
    id: savedDevice.id,
    uuid: savedDevice.uuid,
    token: token
  }));
}

/**
 * Activate a new device to a given location.
 * 
 * @param {Object} req
 * @param {Object} req.body
 * @param {Object} req.user
 * @param {Object} res
 */
const activate = async (req, res) => {
  if (typeof req.user === 'undefined' || !req.user) {
    return res.status(400).send(makeRes('User not found.'));
  }

  let user = req.user;

  // Find device from UUID
  let err, device;
  [err, device] = await to(Device.findOne({
    where: {
      uuid: req.body.uuid
    }
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  if (!device) {
    return res.status(400).send(makeRes('Device not found.'));
  }

  // Find organization
  let organizations;
  [err, organizations] = await to(user.getOrganizations({
    where: {
      id: req.body.organizationId
    }
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  if (!organizations || organizations.length <= 0) {
    return res.status(400).send(makeRes('Organization not found.'));
  }

  let organization = organizations[0];

  // Find location
  let locations;
  [err, locations] = await to(organization.getLocations({
    where: {
      id: req.body.locationId
    }
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  if (!locations || locations.length <= 0) {
    return res.status(400).send(makeRes('Location not found.'));
  }

  let location = locations[0];

  // Update device
  const statusActive = await status.id('active');
  
  [err, device] = await to(device.update({
    organizationId: organization.id,
    locationId: location.id,
    statusId: statusActive
  }));

  if (err) {
    return res.status(500).send(makeRes('Unable to activate device.', null));
  }

  return res.status(200).send(makeRes('Device activated.', {
    id: device.id
  }));
}

module.exports = {
  create,
  activate
};