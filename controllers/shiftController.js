const { User, Shift } = require('../models');
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
  let ShiftInstance = Shift.build(req.body);

  let ShiftValidated;
  [err, ShiftValidated] = await to(ShiftInstance.validate());

  if (err) {
    return res.status(400).send(makeRes('Invalid shift details.', {
      errors: err.errors ? filterErrors(err.errors) : null
    }));
  }

  // Save shift
  let savedShift;
  [err, savedShift] = await to(ShiftInstance.save({
    fields: ['shiftName', 'employeeTypeId', 'ot_startTime','start_time','end_time']
  }));

  if (err) {
    console.log(err);
    return res.status(500).send(makeRes('Unable to add new shift info.', {
      errors: err.errors ? filterErrors(err.errors) : null
    }));
  }

  [err, organization] = await to(organization.addShift(savedShift));

  if (err) {
    return res.status(500).send(makeRes('Unable to add new shift.'));
  }

  return res.status(200).send(makeRes(`Shift Details added to ${organization.name}`, {
    id: savedShift.id
  }));
}

/**
 * List movement logs.
 * 
 * @param {Object} req
 * @param {Object} req.params
 * @param {Object} req.params.organizationId
 * @param {Object} res 
 */
 const listShift = async (req, res) => {
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

  let shiftDetails;
  [err, shiftDetails] = await to(Shift.findAll({
    attributes: ['id', 'shiftName', 'ot_startTime','start_time', 'end_time', 'createdAt','updatedAt'],
    
    order: [
      ['updatedAt', 'DESC']
    ]
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  return res.status(200).send(makeRes('Movement logs retrieved.', { shiftDetails }));
}

/**
 * Delete shift using id.
 * 
 * @param {Object} req
 * @param {Object} req.user
 * @param {Object} req.user.id
 * @param {Object} req.params
 * @param {Object} req.params.id
 * @param {Object} res 
 */
 const Delete = async (req, res) => {
  let err, shift;
  [err, shift] = await to(Shift.destroy({
    where: {
      id: req.body.id
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

  if (!shift) {
    return res.status(404).send(makeRes('Shift not found.'));
  }

  return res.status(200).send(makeRes('Employee details deleted.', { shift}));
}

module.exports = {
  create,
  listShift,
  Delete
};