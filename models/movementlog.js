'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MovementLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MovementLog.belongsTo(models.Device, {
        foreignKey: 'deviceId'
      });

      MovementLog.belongsTo(models.Employee, {
        foreignKey: 'employeeId',
        as: 'employee'
      });

      MovementLog.belongsTo(models.Location, {
        foreignKey: 'locationId',
        as: 'location'
      });

      MovementLog.belongsTo(models.Status, {
        foreignKey: 'statusId',
        as: 'status'
      });
    }
  };
  MovementLog.init({
    deviceId: DataTypes.INTEGER,
    employeeId: DataTypes.INTEGER,
    locationId: DataTypes.INTEGER,
    statusId: DataTypes.INTEGER,
    temperature: DataTypes.DECIMAL(5, 2),
    ambientTemperature: DataTypes.DECIMAL(5, 2),
    entry: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'MovementLog',
  });
  return MovementLog;
};