const Strategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const { to } = require('../utils/helpers');
const { User, Device } = require('../models');

const userOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY
};

const userStrategy = new Strategy(userOpts, async (jwt_payload, done) => {
  let err, user;
  [err, user] = await to(User.findOne({
    attributes: ['id', 'firstName', 'lastName', 'email'],
    where: {
      id: jwt_payload.id,
      statusId: 1
    }
  }));

  if (err) {
    return done(null, false);
  }

  return done(null, user);
});

const deviceOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_DEVICE_SECRET_KEY
};

const deviceStrategy = new Strategy(deviceOpts, async (jwt_payload, done) => {
  let err, device;
  [err, device] = await to(Device.findOne({
    where: {
      id: jwt_payload.id,
      statusId: 1
    }
  }));

  if (err) {
    return done(null, false);
  }

  return done(null, device);
});

module.exports = {
  userStrategy,
  deviceStrategy
};