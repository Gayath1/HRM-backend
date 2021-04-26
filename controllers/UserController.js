const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { User, Organization } = require('../models');
const { makeRes, to, filterErrors } = require('../utils/helpers');
const status = require('../services/status');

/**
 * Create a new user.
 * 
 * @param {Object} req
 * @param {Object} req.body
 * @param {Object} res
 */
const create = async (req, res) => {
  let user = req.body;
  
  // TODO: set user.statusId to 'pending' and verify email
  user.statusId = await status.id('active');
  
  // Build user instance and validate
  let userInstance = User.build(user);

  let err, userValidated;
  [err, userValidated] = await to(userInstance.validate());

  if (err) {
    return res.status(400).send(makeRes('Invalid user details.', {
      errors: err.errors ? filterErrors(err.errors) : null
    }));
  }

  // Save user
  let savedUser;
  [err, savedUser] = await to(userInstance.save());

  if (err) {
    return res.status(400).send(makeRes('Unable to register new user.', {
      errors: err.errors ? filterErrors(err.errors) : null
    }));
  }

  // TODO: Remove token
  // User should only be logged in after verifying the email address
  const secret = process.env.JWT_SECRET_KEY
  const opts = {
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN_SECONDS)
  };

  const token = jwt.sign({ id: savedUser.id }, secret, opts);

  var userData = savedUser.get();
  delete userData.password;
  delete userData.passwordConfirm;
  userData.organizations = [];

  return res.status(200).send(makeRes('User registered.', {
    user: userData,
    token
  }));
}

const login = async (req, res) => {
  let { email, password } = req.body;
  
  if (typeof email === 'undefined' || typeof password === 'undefined') {
    return res.status(400).send(makeRes('Please enter a valid email and password.'));
  }

  let err, user;
  [err, user] = await to(User.findOne({
    attributes: [
      'id',
      'firstName',
      'lastName',
      'email',
      'password',
    ],
    where: {
      email
    },
    include: [
      {
        model: Organization,
        as: 'organizations',
        attributes: ['id', 'name'],
      },
    ],
  }));

  if (err || !user) {
    return res.status(400).send(makeRes('Invalid email or password.'));
  }

  bcrypt.compare(password, user.password, function(err, result) {
    if (err) {
      return res.status(500).send(makeRes('Unable to authenticate. Please try again.'));
    }
    
    if (result !== true) {
      return res.status(400).send(makeRes('Invalid email or password.'));
    }

    const secret = process.env.JWT_SECRET_KEY
    const opts = {
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN_SECONDS)
    };

    const token = jwt.sign({ id: user.id }, secret, opts);

    var userData = user.get();
    delete userData.password;
    
    return res.status(200).send(makeRes('Authentication successful.', {
      user: userData,
      token,
    }));
  });
}

/**
 * Get user details.
 * 
 * @param {Object} req
 * @param {Object} req.user
 * @param {Object} res 
 */
const get = async (req, res) => {
  let err, user;
  [err, user] = await to(User.findAll({
    attributes: [
      'id',
      'firstName',
      'lastName',
      'email',
    ],
    order: [
      ['id', 'DESC']
    ]
    
  }));

  if (err || !user) {
    return res.status(400).send(makeRes('User not found.'));
  }
  
  return res.status(200).send(makeRes('User details retrieved.', {
    user
  }));
}

module.exports = {
  create,
  login,
  get
};