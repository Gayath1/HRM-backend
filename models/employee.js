'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Employee.belongsTo(models.Organization, {
        foreignKey: 'organizationId',
        as: 'organization'
      });

      Employee.hasMany(models.MovementLog, {
        as: 'movementLogs',
        foreignKey: 'employeeId'
      });
      Employee.belongsTo(models.Shift,{
        foreignKey: 'shiftId',
        as: 'shift'
      });
      Employee.belongsTo(models.EmployeeType,{
        foreignKey: 'employeeTypeId',
        as: 'employeeType'
      });

    }
  };
  Employee.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    epf: DataTypes.STRING,
    rfid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'The RFID is already in use'
      },
      validate: {
        notNull: {
          msg: 'The RFID should not be empty'
        },
        notEmpty: {
          msg: 'The RFID should not be empty'
        }
      }
    },
    // organizationId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Employee',
  });
  return Employee;
};