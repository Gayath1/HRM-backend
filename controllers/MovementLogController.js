const { Op } = require("sequelize");
const moment = require("moment");

const { MovementLog, Employee, Location, Organization, User, Status, Shift, OTLogs, OTDetails, EmployeeType, ReviewStatuses } = require('../models');
const { makeRes, to, filterErrors } = require('../utils/helpers');
const status = require('../services/status');

/**
 * Add a new Movement log.
 * 
 * @param {Object} req
 * @param {Object} req.body
 * @param {Object} req.user
 * @param {Object} res
 */
const create = async (req, res) => {
  if (typeof req.user === 'undefined' || !req.user) {
    return res.status(500).send(makeRes('User not identified'));
  }

  let device = req.user;

  // Find employee 
  let err, employee;
  [err, employee] = await to(Employee.findOne({
    attributes: ['id', 'firstName', 'lastName', 'employeeTypeId', 'shiftId'],
    where: {
      rfid: req.body.rfid
    }
  }));

  if (err) {
    console.log(err);
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  if (!employee) {
    return res.status(404).send(makeRes('Employee not found.'));
  }
 
  // Find location
  let location;
  [err, location] = await to(Location.findOne({
    where: {
      id: device.locationId
    }
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  if (!location) {
    return res.status(400).send(makeRes('Location not found.'));
  }

  // Figure out whether the movement is an entry or exit
  let previousMovement;
  [err, previousMovement] = await to(MovementLog.findOne({
    where: {
      locationId: device.locationId,
      employeeId: employee.id
    },
    fields: ['entry'],
    order: [
      ['updatedAt', 'DESC']
    ]
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  let entry = true;
  if (previousMovement) {
    entry = !previousMovement.entry;
  }

  // Check if movement is allowed based on location limit
  if (entry && location.limit >= 0 && location.count >= location.limit) {
    return res.status(200).send(makeRes('Movement restricted.', {
      id: null,
      allowed: false,
      employee: employee,
    }));
  }

  // Create movementLog
  let savedMovementLog;
  [err, savedMovementLog] = await to(MovementLog.create({
    entry: entry,
    deviceId: device.id,
    employeeId: employee.id,
    locationId: device.locationId,
    statusId: entry ? await status.id('entered') : await status.id('exited'),
  }));

  // let checkEmployeeType;
  // [err, checkEmployeeType] = await to(EmployeeType.findOne({
  //   attributes: ['id', 'organizationId', 'Employee_type', 'createdAt', 'updatedAt'],
  //   where: {
  //     id: employee.employeeTypeId
  //   },
  //   // fields: ['Shift'],
  // }));

  // if (err) {
  //   console.log(err);
  //   return res.status(500).send(makeRes('Something went wrong.'));
  // }

  // var EmployeeTypeName = checkEmployeeType.employeeType;

  //Check if OT is accepted or denied
  let reviewstatus = 3; // pending

  //Retrieve Shift according to employee shift id
  let checkShift;
  [err, checkShift] = await to(Shift.findOne({
    attributes: ['id', 'shiftName', 'ot_startTime', 'start_time', 'end_time'],
    where: {
      id: employee.shiftId
    },
    fields: ['Shift'],
  }));

  if (err) {
    console.log(err);
    return res.status(500).send(makeRes('Something went wrong.'));
  }
  var shitName = checkShift.shiftName;

  //Identify the time difference using the moment library
  var shiftstartTime = moment(checkShift.start_time, ["HH:mm"])
  var shiftendTime = moment(savedMovementLog.updatedAt); //Todo: add the employee off time
  var endTimevariance = moment(checkShift.end_time, ["HH:mm"]).add(moment.duration(checkShift.ot_startTime));
  var otStartTime = moment(endTimevariance);

  //OT difference 
  var overtime = moment.duration(0);
  if (shiftendTime.isAfter(otStartTime)) {
    var time = shiftstartTime.isAfter(otStartTime) ? shiftstartTime : otStartTime;
    // overtime = moment.duration(shiftendTime.diff(otStartTime));
    overtime = moment.duration(shiftendTime.diff(time));

  }
  var OTperDay = overtime.get('hours');



  // Create OT Logs
  let savedOTLog;
  if (OTperDay > '0') {
    [err, savedOTLog] = await to(OTLogs.create({
      employeeId: employee.id,
      employeeTypeId: employee.employeeTypeId,
      shiftId: employee.shiftId,
      reviewstatusId: reviewstatus,
      OTHrs: OTperDay,

    }))

    if (err) {
      console.log(err);
      return res.status(500).send(makeRes('Unable to add new OT Info.', {
        errors: err.errors ? filterErrors(err.errors) : null
      }));
    }
  }


  // Update location count
  if (entry) {
    [err, location] = await to(location.increment('count'));
  } else {
    [err, location] = await to(location.decrement('count'));
  }

  if (err) {
    await to(savedMovementLog.destroy());

    return res.status(500).send(makeRes('Unable to add new movement.', {
      errors: err.errors ? filterErrors(err.errors) : null
    }));
  }

  return res.status(200).send(makeRes('Movement added.', {
    id: savedMovementLog.id,
    allowed: true,
    employee: employee,
    OTLogId: typeof savedOTLog === 'undefined' ? null : savedOtLog.id,
    ShiftName:shitName ?? null,
    //EmployeeType:'undefined' ? null : EmployeeTypeName,
  }));


  //Todo Update review status id with button press
}

/**
 * Update temperature of a movement log.
 * 
 * @param {Object} req
 * @param {Object} req.body
 * @param {Object} req.user
 * @param {Object} res
 */
const updateTemperature = async (req, res) => {
  // Find movement log
  let err, movementLog;
  [err, movementLog] = await to(MovementLog.findOne({
    where: {
      id: req.params.movementLogId,
      temperature: null
    }
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  if (!movementLog) {
    return res.status(400).send(makeRes('Movement log not found.'));
  }

  // Movement log updates
  let updatedMovementLog = {
    temperature: req.body.temperature,
    ambientTemperature: req.body.ambientTemperature,
  };

  // Update movement log if temperature limit is exceeded
  let limitExceeded, softLimitExceeded = false;
  if (req.body.temperature >= parseFloat(process.env.TEMP_LIMIT)) {
    limitExceeded = true;

    if (movementLog.entry) {
      updatedMovementLog.entry = false;
      updatedMovementLog.statusId = await status.id('held');

      let location;
      [err, location] = await to(Location.decrement('count', {
        where: {
          id: movementLog.locationId
        }
      }));

      if (err) {
        return res.status(500).send(makeRes('Unable to update temperature.'));
      }
    }
  } else if (req.body.temperature >= parseFloat(process.env.TEMP_SOFT_LIMIT)) {
    softLimitExceeded = true;
  }

  // Update temperature
  [err, movementLog] = await to(movementLog.update(updatedMovementLog));

  if (err) {
    return res.status(500).send(makeRes('Unable to update temperature.'));
  }

  return res.status(200).send(makeRes('Temperature updated.', {
    id: movementLog.id,
    limitExceeded,
    softLimitExceeded
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
const list = async (req, res) => {
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

  let movementLogs;
  [err, movementLogs] = await to(MovementLog.findAll({
    
    attributes: ['id', 'deviceId', 'temperature', 'ambientTemperature', 'entry', 'createdAt', 'updatedAt'],
    include: [
      
      {
        model: Location,
        as: 'location',
        attributes: ['id', 'name'],
        where: {
          organizationId: organization.id
        }
      },
      {
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName'],
      },
      {
        model: Status,
        as: 'status',
        attributes: ['name'],
      },
    
  
    ],
    order: [
      [ 
       
        
        'updatedAt', 
        'DESC'
      ]
    ]
  }));

  if (err) {
    console.log(err);
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  return res.status(200).send(makeRes('Movement logs retrieved.', { movementLogs }));
}

/**
 * List movement logs for an employee.
 * 
 * @param {Object} req
 * @param {Object} req.user
 * @param {Object} req.user.id
 * @param {Object} req.params
 * @param {Object} req.params.employeeId
 * @param {Object} res 
 */
const listEmployee = async (req, res) => {
  // Find employee
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
      },
      {
        model: MovementLog,
        as: 'movementLogs',
        attributes: ['id', 'deviceId', 'temperature', 'ambientTemperature', 'entry', 'createdAt', 'updatedAt'],
        include: [
          {
            model: Location,
            as: 'location',
            attributes: ['id', 'name'],
          },
          {
            model: Status,
            as: 'status',
            attributes: ['name'],
          },
        ],
      }
    ],
    order: [
      [
        {
          model: MovementLog,
          as: 'movementLogs',
        },
        'updatedAt',
        'DESC'
      ]
    ]
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  if (!employee) {
    return res.status(404).send(makeRes('Employee not found.'));
  }

  return res.status(200).send(makeRes('Employee movement logs retrieved.', { employee }));
}

/**
 * List movement logs.
 * 
 * @param {Object} req
 * @param {Object} req.params
 * @param {Object} req.params.organizationId
 * @param {Object} res 
 */
const listFlagged = async (req, res) => {
  let err, movementLogs;
  [err, movementLogs] = await to(MovementLog.findAll({
    attributes: ['id', 'deviceId', 'temperature', 'ambientTemperature', 'entry', 'createdAt', 'updatedAt'],
    where: {
      temperature: {
        [Op.gt]: parseFloat(process.env.TEMP_LIMIT)
      },
    },
    include: [
      {
        model: Location,
        as: 'location',
        attributes: ['id', 'name'],
        required: true,
        include: [
          {
            model: Organization,
            as: 'organization',
            attributes: [],
            required: true,
            where: {
              id: req.params.organizationId,
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
          }
        ],
      },
      {
        model: Employee,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName'],
      },
      {
        model: Status,
        as: 'status',
        attributes: ['name'],
      },
    ],
    order: [
      ['updatedAt', 'DESC']
    ],
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  return res.status(200).send(makeRes('Flagged movement logs retrieved.', { movementLogs }));
}

/**
 * List OT logs for an employee.
 * 
 * @param {Object} req
 * @param {Object} req.user
 * @param {Object} req.user.id
 * @param {Object} req.params
 * @param {Object} req.params.employeeId
 * @param {Object} res 
 */
const listEmployeeOT = async (req, res) => {
  // Find employee
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
      },
      {
        model: OTLogs,
        as: 'otLogs',
        attributes: ['id', 'employeeTypeId', 'employeeId', 'shiftId', 'OTHrs', 'createdAt', 'updatedAt', 'reviewstatusId'],
        required: true,
      }
    ],
    order: [
      [
        {
          model: OTLogs,
          as: 'OTLogs',
        },
        'updatedAt',
        'DESC'
      ]
    ]
  }));

  if (err) {
    console.log(err);
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  if (!employee) {
    return res.status(404).send(makeRes('Employee not found.'));
  }

  return res.status(200).send(makeRes('Employee OT logs retrieved.', { employee }));
}

/**
 * List OT Accepted, Declined and Pending logs.
 * 
 * @param {Object} req
 * @param {Object} req.params
 * @param {Object} req.params.organizationId
 * @param {Object} res 
 */
 const listAllOT = async (req, res) => {
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

  let allOTDetails;
  [err, allOTDetails] = await to(OTLogs.findAll({
    attributes: ['id', 'employeeTypeId', 'employeeId', 'shiftId', 'OTHrs', 'createdAt', 'updatedAt', 'reviewstatusId'],
    
    order: [
      ['updatedAt', 'DESC']
    ]
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  return res.status(200).send(makeRes('Movement logs retrieved.', { allOTDetails }));
}

/**
 * List OT Accepted, Declined and Pending logs.
 * 
 * @param {Object} req
 * @param {Object} req.params
 * @param {Object} req.params.organizationId
 * @param {Object} res 
 */
 const pendingOTList = async (req, res) => {
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

  let allPendingDetails;
  [err, allPendingDetails] = await to(OTLogs.findAll({
    attributes: ['id', 'employeeTypeId', 'employeeId', 'shiftId', 'OTHrs', 'createdAt', 'updatedAt', 'reviewstatusId'],
    where: {
      reviewstatusId: 3,
    },
    order: [
      ['updatedAt', 'DESC']
    ]
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  return res.status(200).send(makeRes('Movement logs retrieved.', { allPendingDetails }));
}

/** 
 * Update temperature of a movement log.
 * 
 * @param {Object} req
 * @param {Object} req.body
 * @param {Object} req.user
 * @param {Object} res
*/
const updateOTLogStatus = async (req, res) => {
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

  // Find OT log
  let otLog;
  [err, otLog] = await to(OTLogs.findOne({
    where: {
      id: req.body.OTLogId
    }
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  if (!otLog) {
    return res.status(400).send(makeRes('OT log not found.'));
  }

  // Find employee
  let employee;
  [err, employee] = await to(Employee.findOne({
    where: {
      id: otLog.employeeId,
      organizationId: organization.id
    }
  }));

  if (err) {
    return res.status(500).send(makeRes('Something went wrong.'));
  }

  if (!employee) {
    return res.status(400).send(makeRes('Employee not found.'));
  }

  // OT log updates
  let updatedOTLog = {
    reviewstatusId: req.body.reviewStatus
  };

  // Update OT log
  [err, otLog] = await to(otLog.update(updatedOTLog));

  if (err) {
    return res.status(500).send(makeRes('Unable to update OT log.'));
  }

  return res.status(200).send(makeRes('OT log updated.', {
    id: otLog.id
  }));
}

module.exports = {
  create,
  updateTemperature,
  list,
  listEmployee,
  listFlagged,
  listEmployeeOT,
  updateOTLogStatus,
  listAllOT,
  pendingOTList
  
};