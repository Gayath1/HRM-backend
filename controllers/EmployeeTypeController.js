const { User, EmployeeType, Organization} = require('../models');
const { makeRes, to, filterErrors } = require('../utils/helpers');

/**
 * Add a new employeeType to a given organization.
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

  // Build employeeType instance and validate
  let EmployeeTypeInstance = EmployeeType.build(req.body);

  let EmployeeTypeValidated;
  [err, EmployeeTypeValidated] = await to(EmployeeTypeInstance.validate());

  if (err) {
    return res.status(400).send(makeRes('Invalid Employee type details.', {
      errors: err.errors ? filterErrors(err.errors) : null
    }));
  }

  // Save EmployeeType
  let savedEmployeeType;
  [err, savedEmployeeType] = await to(EmployeeTypeInstance.save({
    fields: ['organizationId', 'Employee_type']
  }));

  if (err) {
    console,log(savedEmployeeType);
    console.log(err);
    return res.status(500).send(makeRes('Unable to add new Employee type info.1', {
      errors: err.errors ? filterErrors(err.errors) : null
    }));
  }

  [err, organization] = await to(organization.addEmployeetypeInfo(savedEmployeeType));

  if (err) {
    return res.status(500).send(makeRes('Unable to add new Employee type info.2'));
  }

  return res.status(200).send(makeRes(` Employee type details added to ${organization.name}`, {
    id: savedEmployeeType.id
  }));
}

/**
 * List Employee Type Details.
 * 
 * @param {Object} req
 * @param {Object} req.params
 * @param {Object} req.params.organizationId
 * @param {Object} res 
 */
 const get = async (req, res) => {
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

  let EmployeeType;
  [err, EmployeeType] = await to(EmployeeType.findAll({
    attributes: ['id', 'organizationId', 'Employee_type', 'createdAt', 'updatedAt'],
    
    order: [
      ['createdAt', 'DESC']
    ]
  }));

  if (err) {
    console.log(err);
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  return res.status(200).send(makeRes('Employee Type details retrieved.', { EmployeeType}));
}



module.exports = {
  create,
  get
};