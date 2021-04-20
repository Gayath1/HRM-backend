'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Shift extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
     /* Shift.belongsTo(models.EmployeeType, {
        as: 'employeeType',
        foreignKey: 'employeeTypeId'
      });*/
      Shift.hasMany(models.OTLogs, {
        as: 'Shift',
        foreignKey: 'id',
      });
      Shift.belongsTo(models.Organization, {
        foreignKey: 'organizationId',
        as: 'organization'
      });
    }
  };
  Shift.init({
    
    shiftName: DataTypes.STRING, 
    
    // a variable to identify the start time  of the OT hours for a specific shift
    ot_startTime: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: 0
    },
    // Have to add time schedule of the Start and End time of the shift
    start_time: DataTypes.STRING,
    end_time: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Shift',
  });
  return Shift;
};