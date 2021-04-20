'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Location.belongsTo(models.Organization, {
        foreignKey: 'organizationId',
        as: 'organization',
      });

      Location.hasMany(models.Device, {
        as: 'devices',
        foreignKey: 'locationId'
      });

      Location.hasMany(models.MovementLog, {
        as: 'movementLogs',
        foreignKey: 'locationId'
      });
    }
  };
  Location.init({
    name: DataTypes.STRING,
    limit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
  }, {
    sequelize,
    modelName: 'Location',
  });
  return Location;
};