'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DeviceType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DeviceType.hasMany(models.Device, {
        as: 'devices',
        foreignKey: 'deviceTypeId'
      });
    }
  };
  DeviceType.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'DeviceType',
  });
  return DeviceType;
};