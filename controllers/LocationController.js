const { User, Location } = require('../models');
const { makeRes, to, filterErrors } = require('../utils/helpers');

/**
 * Add a new location to a given organization.
 * 
 * @param {Object} req
 * @param {Object} req.body
 * @param {Object} req.user
 * @param {number} req.user.id
 * @param {Object} req.params
 * @param {Object} req.params.organizationId
 * @param {Object} res
 */
const create = async (req, res) => {
  // Find user
  let err, user;
  [err, user] = await to(User.findOne({
    where: {
      id: req.user.id
    }
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  if (!user) {
    return res.status(400).send(makeRes('User not found.'));
  }

  // Find organization
  let organizations;
  [err, organizations] = await to(user.getOrganizations({
    where: {
      id: req.params.organizationId
    }
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  if (!organizations || organizations.length <= 0) {
    return res.status(400).send(makeRes('Organization not found.'));
  }

  let organization = organizations[0];

  // Build location instance and validate
  let locationInstance = Location.build(req.body);

  let locationValidated;
  [err, locationValidated] = await to(locationInstance.validate());

  if (err) {
    return res.status(400).send(makeRes('Invalid location details.', {
      errors: err.errors ? filterErrors(err.errors) : null
    }));
  }

  // Save location
  let savedLocation;
  [err, savedLocation] = await to(locationInstance.save());

  if (err) {
    return res.status(500).send(makeRes('Unable to add new location.', {
      errors: err.errors ? filterErrors(err.errors) : null
    }));
  }

  [err, organization] = await to(organization.addLocation(savedLocation));

  if (err) {
    return res.status(500).send(makeRes('Unable to add new location.', null));
  }

  return res.status(200).send(makeRes(`Location added to ${organization.name}`, {
    id: savedLocation.id
  }));
}

module.exports = {
  create
};