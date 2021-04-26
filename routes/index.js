
const router = require('express').Router();
const passport = require('passport');

const jwtStrategy = require("../services/jwtStrategy");
const UserController = require('../controllers/UserController');
const OrganizationController = require('../controllers/OrganizationController');
const EmployeeController = require('../controllers/EmployeeController');
const LocationController = require('../controllers/LocationController');
const DeviceTypeController = require('../controllers/DeviceTypeController');
const DeviceController = require('../controllers/DeviceController');
const MovementLogController = require('../controllers/MovementLogController');
const OTDetailsController = require('../controllers/OTDetailsController');
const shiftController = require('../controllers/shiftController');
const ShiftTypeController = require('../controllers/ShiftTypeController');
const EmployeeTypeController = require('../controllers/EmployeeTypeController');
const CsvinsertController = require('../controllers/CSVinsertController');
let upload = require('../services/multer_config.js');



passport.use('jwt-user', jwtStrategy.userStrategy);
passport.use('jwt-device', jwtStrategy.deviceStrategy);

// users
router.post('/users', UserController.create);
router.post('/users/login', UserController.login);
router.get('/users', passport.authenticate('jwt-user', { session: false }), UserController.get);

// organizations
router.post('/organizations', passport.authenticate('jwt-user', { session: false }), OrganizationController.create);
router.get('/organizations/:organizationId/summary', passport.authenticate('jwt-user', { session: false }), OrganizationController.summary);

// employees
router.post('/organizations/:organizationId/employees', passport.authenticate('jwt-user', { session: false }), EmployeeController.create);
router.get('/employees/:employeeId', passport.authenticate('jwt-user', { session: false }), EmployeeController.get);
router.get('/organizations/:organizationId/employeeslist', passport.authenticate('jwt-user', { session: false }), EmployeeController.listEmployees);
router.post('/organizations/:organizationId/employeeslist/delete', passport.authenticate('jwt-user', { session: false }), EmployeeController.Delete);

// locations
router.post('/organizations/:organizationId/locations', passport.authenticate('jwt-user', { session: false }), LocationController.create);

// device types
router.get('/devicetypes', passport.authenticate('jwt-user', { session: false }), DeviceTypeController.list);

// devices
router.post('/devices', passport.authenticate('jwt-user', { session: false }), DeviceController.create);
router.post('/devices/activate', passport.authenticate('jwt-user', { session: false }), DeviceController.activate);

// movement logs
router.post('/movements', passport.authenticate('jwt-device', { session: false }), MovementLogController.create);
router.post('/movements/:movementLogId/temperature', passport.authenticate('jwt-device', { session: false }), MovementLogController.updateTemperature);
router.get('/organizations/:organizationId/movements', passport.authenticate('jwt-user', { session: false }), MovementLogController.list);
router.get('/employees/:employeeId/movements', passport.authenticate('jwt-user', { session: false }), MovementLogController.listEmployee);
router.get('/organizations/:organizationId/movements/flagged', passport.authenticate('jwt-user', { session: false }), MovementLogController.listFlagged);


// employee types
router.post('/organizations/:organizationId/employeetypes', passport.authenticate('jwt-user', { session: false }), EmployeeTypeController.create);
router.get('/organizations/:organizationId/employeetypes/list',  EmployeeTypeController.get);

// overtime
router.post('/organizations/:organizationId/overtime', passport.authenticate('jwt-user', { session: false }), OTDetailsController.create);
router.get('/organizations/:organizationId/overtime', passport.authenticate('jwt-user', { session: false }), OTDetailsController.listOT);
router.get('/employees/:employeeId/overtime', passport.authenticate('jwt-user', { session: false }), MovementLogController.listEmployeeOT);
router.post('/organizations/:organizationId/overtime/update', passport.authenticate('jwt-user', { session: false }), MovementLogController.updateOTLogStatus);
router.get('/organizations/:organizationId/overtime/all', passport.authenticate('jwt-user', { session: false }), MovementLogController.listAllOT);
router.get('/organizations/:organizationId/movements/pendingOT', passport.authenticate('jwt-user', { session: false }), MovementLogController.pendingOTList);
router.post('/organizations/:organizationId/overtime/Delete', passport.authenticate('jwt-user', { session: false }), OTDetailsController.Delete);

//shift
router.post('/organizations/:organizationId/shift', passport.authenticate('jwt-user', { session: false }), shiftController.create);
router.get('/organizations/:organizationId/shifttypes', passport.authenticate('jwt-user', { session: false }),  shiftController.listShift);
router.post('/organizations/:organizationId/shift/Delete', passport.authenticate('jwt-user', { session: false }), shiftController.Delete);



module.exports = router;