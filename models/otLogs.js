'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OTLogs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      OTLogs.belongsTo(models.Shift, {
        foreignKey: 'shiftId',
        as: 'Shift'
      });

      OTLogs.belongsTo(models.Employee, {
        foreignKey: 'employeeId',
        as: 'employee'
      });

      OTLogs.belongsTo(models.Employee, {
        foreignKey: 'employeeTypeId',
        as: 'employeeType'
      });
      OTLogs.belongsTo(models.OTReviewStatus, {
        foreignKey: 'reviewstatusId',
        as: 'OTReviewStatus'
      });

     
    }
  };
  OTLogs.init({
    shiftId: DataTypes.INTEGER,
    employeeId:DataTypes.INTEGER,
    employeeTypeId:DataTypes.INTEGER,
    reviewstatusId:DataTypes.INTEGER,
    OTHrs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    // Have to add time schedule of the Start and End time of the shift
    
  }, {
    sequelize,
    modelName: 'OTLogs',
  });
  return OTLogs;
};