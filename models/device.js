'use strict';
const Sequelize = require('sequelize');
const { Model } = Sequelize;
module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Device.belongsTo(models.DeviceType, {
        foreignKey: 'deviceTypeId'
      });

      Device.belongsTo(models.Organization, {
        foreignKey: 'organizationId'
      });

      Device.belongsTo(models.Location, {
        foreignKey: 'locationId'
      });

      Device.hasMany(models.MovementLog, {
        as: 'movementLogs',
        foreignKey: 'deviceId'
      });
    }
  };
  Device.init({
    uuid: {
      type: DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    statusId: DataTypes.INTEGER,
    deviceTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'The device type should not be empty'
        },
        notEmpty: {
          msg: 'The device type should not be empty'
        },
        isInt: {
          msg: 'The device type is invalid'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Device',
  });
  return Device;
};