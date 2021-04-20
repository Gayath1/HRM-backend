const { User, OTDetails } = require('../models');
const { makeRes, to, filterErrors } = require('../utils/helpers');

/**
 * Add a new employee to a given organization.
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

  // Build shift instance and validate
  let OTDetailsInstance = OTDetails.build(req.body);

  let OTDetailsValidated;
  [err, OTDetailsValidated] = await to(OTDetailsInstance.validate());

  if (err) {
    return res.status(400).send(makeRes('Invalid Overtime details.', {
      errors: err.errors ? filterErrors(err.errors) : null
    }));
  }

  // Save shift
  let savedOTDetails;
  [err, savedOTDetails] = await to(OTDetailsInstance.save({
    fields: ['employeeType', 'otHrsMin', 'incharge_email', 'otHrsMax', 'otRate']
  }));

  if (err) {
    console.log(err);
    return res.status(500).send(makeRes('Unable to add new overtime info.', {
      errors: err.errors ? filterErrors(err.errors) : null
    }));
  }

  [err, organization] = await to(organization.addOTInfo(savedOTDetails));

  if (err) {
    return res.status(500).send(makeRes('Unable to add new OT info.'));
  }

  return res.status(200).send(makeRes(`OTDetails added to ${organization.name}`, {
    id: savedOTDetails.id
  }));
}



/**
 * List OT Details.
 * 
 * @param {Object} req
 * @param {Object} req.params
 * @param {Object} req.params.organizationId
 * @param {Object} res 
 */
 const listOT = async (req, res) => {
  // Find organization
  let err, organizations;
  [err, organizations] = await to(req.user.getOrganizations({
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

  let OtDetails;
  [err, OtDetails] = await to(OTDetails.findAll({
    attributes: ['id', 'employeeTypeId', 'otHrsMin', 'incharge_email', 'otHrsMax', 'otRate', 'createdAt', 'updatedAt'],
    
    order: [
      ['updatedAt', 'DESC']
    ]
  }));

  if (err) {
    console.log(err);
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  return res.status(200).send(makeRes('Movement logs retrieved.', { OtDetails }));
}


module.exports = {
  create,
  listOT
};