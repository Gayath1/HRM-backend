const { User, Employee, Organization, Shift, EmployeeType } = require('../models');
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


  // Build employee instance and validate
  let employeeInstance = Employee.build(req.body);

  let employeeValidated;
  [err, employeeValidated] = await to(employeeInstance.validate());

  if (err) {
    return res.status(400).send(makeRes('Invalid employee details.', {
      errors: err.errors ? filterErrors(err.errors) : null
    }));
  }

  // Save employee
  let savedEmployee;
  [err, savedEmployee] = await to(employeeInstance.save({
    fields: ['firstName', 'lastName', 'rfid','shiftId','employeeTypeId']
  }));

  if (err) {
    console.log(err);
    return res.status(500).send(makeRes('Unable to add new employee.', {
      errors: err.errors ? filterErrors(err.errors) : null
    }));
  }

  [err, organization] = await to(organization.addEmployee(savedEmployee));

  if (err) {
    return res.status(500).send(makeRes('Unable to add new employee.'));
  }

  return res.status(200).send(makeRes(`Employee added to ${organization.name}`, {
    id: savedEmployee.id
  }));
}

/**
 * Get employee details.
 * 
 * @param {Object} req
 * @param {Object} req.user
 * @param {Object} req.user.id
 * @param {Object} req.params
 * @param {Object} req.params.employeeId
 * @param {Object} res 
 */
const get = async (req, res) => {
  let err, employee;
  [err, employee] = await to(Employee.findOne({
    where: {
      id: req.params.employeeId
    },
    include: [
      {
        model: Organization,
        as: 'organization',
        attributes: ['name'],
        required: true,
        include: [
          {
            model: User,
            as: 'users',
            attributes: [],
            where: {
              id: req.user.id
            }
          }
        ]
      }
    ]
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  if (!employee) {
    return res.status(404).send(makeRes('Employee not found.'));
  }

  return res.status(200).send(makeRes('Employee details retrieved.', { employee }));
}


/**
 * List employees.
 * 
 * @param {Object} req
 * @param {Object} req.params
 * @param {Object} req.params.organizationId
 * @param {Object} res 
 */
 const listEmployees = async (req, res) => {
  // Find organization
  let err, organizations;
  [err, organizations] = await to(req.user.getOrganizations({
    where: {
      id: req.params.organizationId
    }
  }));

  if (err) {
    console.log(err);
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  if (!organizations || organizations.length <= 0) {
    return res.status(400).send(makeRes('Organization not found.'));
  }

  let organization = organizations[0];

  let EmployeeList;
  [err, EmployeeList] = await to(Employee.findAll({
    attributes: ['id','firstName', 'lastName', 'rfid','shiftId', 'employeeTypeId', 'createdAt','updatedAt'],
    
    order: [
      ['updatedAt', 'DESC']
    ]
  }));

  if (err) {
    console.log(err);
    return res.status(500).send(makeRes('Something went wrong1.'));
  }

  

  return res.status(200).send(makeRes('Movement logs retrieved.', { EmployeeList }));
}

module.exports = {
  create,
  get,
  listEmployees
};