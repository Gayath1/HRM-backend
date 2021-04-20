const { Op } = require("sequelize");

const { User, Organization, OrganizationUser, MovementLog, Location, Employee } = require('../models');
const { makeRes, to, filterErrors } = require('../utils/helpers');

/**
 * Create a new organization.
 * 
 * @param {Object} req
 * @param {Object} req.body
 * @param {Object} req.user
 * @param {number} req.user.id
 * @param {Object} res
 */
const create = async (req, res) => {
  let organization = req.body;
  
  // Find user
  const user = await User.findOne({
    where: {
      id: req.user.id
    }
  });

  if (!user) {
    return res.status(400).send(makeRes('Invalid user.'));
  }

  // Build organization instance and validate
  let organizationInstance = Organization.build(organization);

  let err, organizationValidated;
  [err, organizationValidated] = await to(organizationInstance.validate());

  if (err) {
    return res.status(400).send(makeRes('Invalid organization details.', {
      errors: err.errors ? filterErrors(err.errors) : null
    }));
  }

  // Save organization
  let savedOrganization;
  [err, savedOrganization] = await to(organizationInstance.save());

  if (err) {
    return res.status(500).send(makeRes('Unable to create new organization.', {
      errors: err.errors ? filterErrors(err.errors) : null
    }));
  }

  // Insert user to organization
  const organizationUser = {
    userId: user.id,
    organizationId: savedOrganization.id,
    permissionId: 1 // TODO: get owner permission ID from a helper method
  };

  let savedOrganizationUser;
  [err, savedOrganizationUser] = await to(OrganizationUser.create(organizationUser));

  if (err) {
    return res.status(500).send(makeRes('Unable to add user to organization.', {
      errors: err.errors ? filterErrors(err.errors) : null
    }));
  }

  return res.status(200).send(makeRes('Organization created.', {
    organization: savedOrganization
  }));
}

/**
 * Create a new organization.
 * 
 * @param {Object} req
 * @param {Object} req.user
 * @param {Object} req.user.id
 * @param {Object} req.params
 * @param {Object} req.params.organizationId
 * @param {Object} res
 */
const summary = async (req, res) => {
  // Find organization
  let err, organization;
  [err, organization] = await to(Organization.findOne({
    where: {
      id: req.params.organizationId
    },
    include: [
      {
        model: User,
        as: 'users',
        attributes: [],
        required: true,
        through: {
          where: {
            userId: req.user.id,
          },
        },
      }
    ],
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  if (!organization) {
    return res.status(400).send(makeRes('Organization not found.'));
  }

  // Sum location counts to get current employees
  let currentEmployees;
  [err, currentEmployees] = await to(Location.sum('count', {
    where: {
      organizationId: organization.id
    }
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  // Count high temps in last 24 hours
  let flaggedEmployees;
  [err, flaggedEmployees] = await to(MovementLog.count({
    where: {
      temperature: {
        [Op.gt]: parseFloat(process.env.TEMP_LIMIT)
      },
      createdAt: {
        [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000)
      },
    },
    col: 'employeeId',
    distinct: true,
    include: [
      {
        model: Location,
        as: 'location',
        where: {
          organizationId: organization.id
        }
      }
    ],
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  // Count total employees
  let totalEmployees;
  [err, totalEmployees] = await to(Employee.count({
    where: {
      organizationId: organization.id
    }
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  return res.status(200).send(makeRes('Organization summary retrieved.', {
    organization: {
      ...organization.get(),
      totalEmployees,
      currentEmployees,
      flaggedEmployees,
    }
  }));
}

module.exports = {
  create,
  summary,
};